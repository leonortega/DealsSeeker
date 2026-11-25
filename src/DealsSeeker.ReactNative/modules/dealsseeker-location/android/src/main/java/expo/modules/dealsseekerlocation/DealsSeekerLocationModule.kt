package expo.modules.dealsseekerlocation

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.os.Handler
import android.os.HandlerThread
import androidx.core.content.ContextCompat
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

private const val STALE_POSITION_MS = 60_000L

class DealsSeekerLocationModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("DealsSeekerLocation")

    AsyncFunction("getCurrentPositionAsync") { timeoutMs: Int, promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.reject("LOCATION_UNAVAILABLE", "Android context is unavailable", null)
        return@AsyncFunction
      }

      val fineGranted = ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.ACCESS_FINE_LOCATION
      ) == PackageManager.PERMISSION_GRANTED
      val coarseGranted = ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.ACCESS_COARSE_LOCATION
      ) == PackageManager.PERMISSION_GRANTED
      if (!fineGranted && !coarseGranted) {
        promise.reject("LOCATION_PERMISSION_DENIED", "Location permission is denied", null)
        return@AsyncFunction
      }

      val manager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
      val provider = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)
        .firstOrNull { manager.isProviderEnabled(it) }
      if (provider == null) {
        promise.reject("LOCATION_PROVIDER_UNAVAILABLE", "No location provider is enabled", null)
        return@AsyncFunction
      }

      @Suppress("MissingPermission")
      val cached = manager.getLastKnownLocation(provider)
      if (cached != null && System.currentTimeMillis() - cached.time <= STALE_POSITION_MS) {
        promise.resolve(cached.toMap())
        return@AsyncFunction
      }

      val thread = HandlerThread("DealsSeekerLocation").apply { start() }
      val handler = Handler(thread.looper)
      var settled = false

      fun finish(block: () -> Unit) {
        if (settled) return
        settled = true
        handler.removeCallbacksAndMessages(null)
        thread.quit()
        block()
      }

      val listener = object : LocationListener {
        override fun onLocationChanged(location: Location) {
          @Suppress("MissingPermission")
          manager.removeUpdates(this)
          finish { promise.resolve(location.toMap()) }
        }

        override fun onProviderDisabled(provider: String) = Unit
        override fun onProviderEnabled(provider: String) = Unit

        @Deprecated("Deprecated in Java")
        override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) = Unit
      }

      handler.postDelayed({
        @Suppress("MissingPermission")
        manager.removeUpdates(listener)
        finish { promise.reject("LOCATION_TIMEOUT", "No position was produced in time", null) }
      }, timeoutMs.toLong())

      @Suppress("MissingPermission")
      manager.requestSingleUpdate(provider, listener, handler.looper)
    }
  }
}

private fun Location.toMap(): Map<String, Double> = mapOf(
  "latitude" to latitude,
  "longitude" to longitude
)
