package com.lenovo.prerna

import android.os.Bundle
import android.util.Log
import androidx.activity.enableEdgeToEdge

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    try {
      enableEdgeToEdge()
    } catch (e: Exception) {
      Log.w("PRERNA", "enableEdgeToEdge non-fatal: ${e.message}")
    }
    super.onCreate(savedInstanceState)
  }
}
