Set-StrictMode -Version Latest
function Test-AutoWindow {
  param([switch]$Force)
  if ($Force) { return $true }
  $dow = (Get-Date).DayOfWeek
  $isWorkday = $dow -in @('Monday','Tuesday','Wednesday','Thursday','Friday')
  $now = Get-Date
  $start = (Get-Date).Date.AddHours(22)
  $end   = (Get-Date).Date.AddDays(1).AddHours(13).AddMinutes(30)
  if (-not $isWorkday) { return $false }
  if ($now -lt $start -or $now -gt $end) { return $false }
  return $true
}
