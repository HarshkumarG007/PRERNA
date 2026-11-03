package com.prerna.sanctuary

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.core.view.ViewCompat
import androidx.core.view.WindowInsetsCompat

class MainActivity : TauriActivity() {
  private var pendingPermissionRequest: PermissionRequest? = null

  private val requestPermissionLauncher = registerForActivityResult(
    ActivityResultContracts.RequestMultiplePermissions()
  ) { permissions ->
    val cameraGranted = permissions[Manifest.permission.CAMERA] ?: false
    if (cameraGranted) {
      pendingPermissionRequest?.grant(pendingPermissionRequest?.resources)
    } else {
      pendingPermissionRequest?.deny()
    }
    pendingPermissionRequest = null
  }

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
          // WCAG 1.4.4 accessibility: allow pinch-zoom, conceal redundant on-screen zoom buttons
          setSupportZoom(true)
          builtInZoomControls = true
          displayZoomControls = false
        }

        // Configure WebChromeClient to handle camera permissions for QR scanning
        view.webChromeClient = object : WebChromeClient() {
          override fun onPermissionRequest(request: PermissionRequest) {
            val resources = request.resources
            val needsCamera = resources.contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE)

            if (needsCamera) {
              val hasCamera = ContextCompat.checkSelfPermission(
                this@MainActivity,
                Manifest.permission.CAMERA
              ) == PackageManager.PERMISSION_GRANTED

              if (hasCamera) {
                request.grant(resources)
              } else {
                pendingPermissionRequest = request
                requestPermissionLauncher.launch(arrayOf(Manifest.permission.CAMERA))
              }
            } else {
              request.grant(resources)
            }
          }
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

