package com.lenovo.prerna

import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : TauriActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    try {
      enableEdgeToEdge()
    } catch (e: Exception) {
      Log.w("PRERNA", "enableEdgeToEdge non-fatal: ${e.message}")
    }
    super.onCreate(savedInstanceState)

    try {
      val rootView = window.decorView.findViewById<View>(android.R.id.content)
      ViewCompat.setOnApplyWindowInsetsListener(rootView) { v, insets ->
        val statusBar = insets.getInsets(WindowInsetsCompat.Type.statusBars())
        val navBar = insets.getInsets(WindowInsetsCompat.Type.navigationBars())
        v.setPadding(statusBar.left, statusBar.top, statusBar.right, navBar.bottom)
        insets
      }

      rootView.post {
        configureWebView(rootView)
      }
    } catch (e: Exception) {
      Log.w("PRERNA", "WindowInsets listener non-fatal: ${e.message}")
    }
  }

  private fun configureWebView(view: View) {
    if (view is WebView) {
      try {
        view.settings.apply {
          useWideViewPort = true
          loadWithOverviewMode = true
          setSupportZoom(false)
          builtInZoomControls = false
          displayZoomControls = false
        }
      } catch (e: Exception) {
        Log.w("PRERNA", "WebView config non-fatal: ${e.message}")
      }
    } else if (view is ViewGroup) {
      for (i in 0 until view.childCount) {
        configureWebView(view.getChildAt(i))
      }
    }
  }
}
