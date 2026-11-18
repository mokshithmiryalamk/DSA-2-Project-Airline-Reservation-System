$ErrorActionPreference = "Stop"
Write-Host "========================================================"
Write-Host "   AEROOPS FULL-STACK LIVE INTEGRATION VERIFICATION    "
Write-Host "========================================================"

$backendDir = "D:\Moki\Portfolio\projects\Airplane_Management_Org_Clone\backend"
Set-Location $backendDir

# Build backend jar or run spring-boot
Write-Host "[1/6] Launching Spring Boot backend process..."
$proc = Start-Process -FilePath "mvn.cmd" -ArgumentList "spring-boot:run", "-Dspring-boot.run.profiles=dev" -PassThru -NoNewWindow

try {
    $started = $false
    $retries = 30
    while ($retries -gt 0) {
        Start-Sleep -Seconds 2
        try {
            $resp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health" -Method Get -TimeoutSec 3 -ErrorAction SilentlyContinue
            if ($resp -and $resp.status -eq "UP") {
                $started = $true
                break
            }
        } catch {}
        $retries--
        Write-Host "Waiting for backend on http://localhost:8080/api/v1/health ... ($retries left)"
    }

    if (-not $started) {
        throw "Backend failed to start within 60 seconds."
    }

    Write-Host "[PASS] Spring Boot REST backend is UP and healthy!"

    # 2. Test Health Endpoint
    Write-Host "`n[2/6] Verifying Health & Metadata Contract..."
    $health = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health" -Method Get
    Write-Host "Health Status: $($health.status) | Service: $($health.service)"
    if ($health.status -ne "UP") { throw "Expected status UP" }

    # 3. Test Airports Contract
    Write-Host "`n[3/6] Verifying Airports Flat DTO..."
    $airports = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/airports" -Method Get
    Write-Host "Airports count: $($airports.Length)"
    $del = $airports | Where-Object { $_.airportCode -eq "DEL" }
    if (-not $del) { throw "Airport DEL not found" }
    Write-Host "DEL Airport: $($del.airportCode) - $($del.city) ($($del.airportName))"
    if (-not $del.city) { throw "AirportDto missing city field" }

    # 4. Test Flights Flat DTO Contract
    Write-Host "`n[4/6] Verifying Flights Flat DTO Shape..."
    $flights = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/flights" -Method Get
    Write-Host "Flights count: $($flights.Length)"
    $f1 = $flights[0]
    Write-Host "Sample Flight: $($f1.flightId) | $($f1.flightName) | $($f1.sourceCode) -> $($f1.destinationCode) | Base Fare: $($f1.fare) | Occupancy: $($f1.bookedSeats)/$($f1.capacity) ($($f1.availableSeats) available)"
    if (-not $f1.sourceCode -or -not $f1.destinationCode) { throw "FlightDto missing flat sourceCode or destinationCode" }
    if ($null -eq $f1.bookedSeats -or $null -eq $f1.availableSeats) { throw "FlightDto missing bookedSeats or availableSeats" }

    # 5. Test Passengers Flat DTO Contract
    Write-Host "`n[5/6] Verifying Passengers Flat DTO Shape..."
    $passengers = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/passengers" -Method Get
    Write-Host "Passengers count: $($passengers.Length)"
    $p1 = $passengers[0]
    Write-Host "Sample Passenger: #$($p1.passengerId) - $($p1.passengerName) ($($p1.gender), $($p1.age) yrs)"
    if (-not $p1.passengerId -or -not $p1.passengerName) { throw "PassengerDto missing passengerId or passengerName" }

    # 6. Test Bookings Flat DTO Contract & Booking Lifecycle
    Write-Host "`n[6/6] Verifying Bookings Flat DTO & Operational Lifecycle..."
    $bookings = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/bookings" -Method Get
    Write-Host "Bookings count: $($bookings.Length)"
    $b1 = $bookings[0]
    Write-Host "Sample Booking: Ticket #$($b1.ticketId) | Passenger: $($b1.passengerName) (#$($b1.passengerId)) | Sector: $($b1.flightId) ($($b1.sourceCode) -> $($b1.destinationCode)) | Seat: $($b1.seatNumber) | Status: $($b1.status)"
    if (-not $b1.passengerName -or -not $b1.flightId -or -not $b1.sourceCode) { throw "BookingDto missing flat fields" }

    # Test Live Booking Creation
    Write-Host "`nIssuing new commercial reservation for Passenger #$($p1.passengerId) on $($f1.flightId)..."
    $bookPayload = @{
        passengerId = $p1.passengerId
        flightId = $f1.flightId
    } | ConvertTo-Json
    $newTicket = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/bookings" -Method Post -Body $bookPayload -ContentType "application/json"
    Write-Host "[PASS] Successfully issued Ticket #$($newTicket.ticketId) with auto-allocated seat: $($newTicket.seatNumber)"
    if ($newTicket.status -ne "CONFIRMED") { throw "Expected CONFIRMED status" }
    if ($newTicket.passengerName -ne $p1.passengerName) { throw "Passenger name mismatch on new ticket" }

    # Cancel the reservation
    Write-Host "Cancelling Ticket #$($newTicket.ticketId)..."
    $cancelResp = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/bookings/$($newTicket.ticketId)/cancel" -Method Post
    Write-Host "[PASS] Successfully cancelled Ticket #$($newTicket.ticketId) (Status: $($cancelResp.status))"
    if ($cancelResp.status -ne "CANCELLED") { throw "Expected CANCELLED status" }

    Write-Host "`n========================================================"
    Write-Host "ALL FULL-STACK LIVE INTEGRATION TESTS PASSED (100% OK)!"
    Write-Host "========================================================"
} finally {
    Write-Host "Stopping backend process tree..."
    if ($proc -and -not $proc.HasExited) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        # Also kill any leftover java processes on port 8080
        $portProc = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
        if ($portProc) {
            Stop-Process -Id $portProc -Force -ErrorAction SilentlyContinue
        }
    }
}
