package com.pocketpaisa.pro

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.webkit.JavascriptInterface
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import android.widget.ImageView
import androidx.core.app.NotificationCompat
import kotlin.math.abs

class EdgeOverlayService : Service() {

    private lateinit var windowManager: WindowManager
    private var edgeHandleView: View? = null
    private var panelView: View? = null
    private var webView: WebView? = null
    private var handleParams: WindowManager.LayoutParams? = null
    private var panelParams: WindowManager.LayoutParams? = null

    private var initialX = 0
    private var initialY = 0
    private var initialTouchX = 0f
    private var initialTouchY = 0f
    private var isDragging = false
    private var dragThreshold = 10

    companion object {
        private const val CHANNEL_ID = "EdgeOverlayServiceChannel"
        private const val NOTIFICATION_ID = 2026
        const val ACTION_START = "ACTION_START_OVERLAY"
        const val ACTION_STOP = "ACTION_STOP_OVERLAY"
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                startForeground(NOTIFICATION_ID, buildNotification())
                showEdgeHandle()
            }
            ACTION_STOP -> {
                removeOverlayViews()
                stopSelf()
            }
        }
        return START_STICKY
    }

    private fun showEdgeHandle() {
        if (edgeHandleView != null) return

        // Programmatically draw the floating handle or load via View
        val layoutInflater = getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
        edgeHandleView = View(this).apply {
            setBackgroundResource(R.drawable.edge_pill_shape)
        }

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        handleParams = WindowManager.LayoutParams(
            24, // width (pixels)
            180, // height (pixels)
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.TOP or Gravity.END // Dock on right edge by default
            x = 0
            y = windowManager.defaultDisplay.height / 3 // Vertical Position
        }

        edgeHandleView?.setOnTouchListener(object : View.OnTouchListener {
            override fun onTouch(v: View?, event: MotionEvent?): Boolean {
                if (event == null) return false
                when (event.action) {
                    MotionEvent.ACTION_DOWN -> {
                        initialX = handleParams!!.x
                        initialY = handleParams!!.y
                        initialTouchX = event.rawX
                        initialTouchY = event.rawY
                        isDragging = false
                        return true
                    }
                    MotionEvent.ACTION_MOVE -> {
                        val deltaX = event.rawX - initialTouchX
                        val deltaY = event.rawY - initialTouchY

                        if (!isDragging && (abs(deltaX) > dragThreshold || abs(deltaY) > dragThreshold)) {
                            isDragging = true
                        }

                        if (isDragging) {
                            handleParams!!.y = initialY + deltaY.toInt()
                            windowManager.updateViewLayout(edgeHandleView, handleParams)
                        }
                        return true
                    }
                    MotionEvent.ACTION_UP -> {
                        val totalDeltaX = event.rawX - initialTouchX
                        val totalDeltaY = event.rawY - initialTouchY

                        // Detection for Tap or Inward Swipe (Swiped Left from Right side)
                        val isInwardSwipe = totalDeltaX < -40
                        val isTap = !isDragging || (abs(totalDeltaX) < dragThreshold && abs(totalDeltaY) < dragThreshold)

                        if (isTap || isInwardSwipe) {
                            openQuickPanel()
                        }
                        return true
                    }
                }
                return false
            }
        })

        windowManager.addView(edgeHandleView, handleParams)
    }

    private fun openQuickPanel() {
        if (panelView != null) return

        val layoutType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        // Hide edge handle while panel is active
        edgeHandleView?.visibility = View.GONE

        // Build Panel container & WebView programmatically for lightning fast performance
        val frameLayout = FrameLayout(this).apply {
            setBackgroundColor(Color.parseColor("#800F172A")) // Blur shadow backdrop overlay
        }

        val webViewContainer = FrameLayout(this).apply {
            setBackgroundColor(Color.parseColor("#151D2E")) // Dark mode matching color
        }

        // Setup Panel dimensions (e.g. Slide-over right panel)
        val containerParams = FrameLayout.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT
        )
        frameLayout.addView(webViewContainer, containerParams)

        // Webview setup
        webView = WebView(this).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            addJavascriptInterface(AndroidOverlayBridge(this@EdgeOverlayService), "AndroidOverlayBridge")
            
            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    // Sync initial data or inject CSS if required
                    evaluateJavascript("if(window.EdgeOverlayService) { window.EdgeOverlayService.open(); }", null)
                }
            }
            
            // Load app root pointing to quick-launch PWA route (or local index.html)
            loadUrl("file:///android_asset/public/index.html")
        }

        webViewContainer.addView(webView, FrameLayout.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT
        ))

        panelParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            layoutType,
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        )

        panelView = frameLayout
        windowManager.addView(panelView, panelParams)
    }

    fun collapsePanel() {
        panelView?.let {
            windowManager.removeView(it)
            panelView = null
            webView = null
        }
        // Show edge handle back
        edgeHandleView?.visibility = View.VISIBLE
    }

    private fun removeOverlayViews() {
        edgeHandleView?.let {
            windowManager.removeView(it)
            edgeHandleView = null
        }
        panelView?.let {
            windowManager.removeView(it)
            panelView = null
            webView = null
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        removeOverlayViews()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "PocketPaisa Active Advisor Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Enables system-wide Floating Edge Panel for instant budget tracking."
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        val stopIntent = Intent(this, EdgeOverlayService::class.java).apply {
            action = ACTION_STOP
        }
        val stopPendingIntent = PendingIntent.getService(
            this, 0, stopIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("PocketPaisa Pro Active")
            .setContentText("System-Wide Floating Edge Panel is active.")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .addAction(android.R.drawable.ic_menu_close_clear_cancel, "Disable Overlay", stopPendingIntent)
            .setPriority(NotificationCompat.PRIORITY_MIN)
            .setOngoing(true)
            .build()
    }

    // JS Bridge class accessible via window.AndroidOverlayBridge
    class AndroidOverlayBridge(private val service: EdgeOverlayService) {
        @JavascriptInterface
        fun closeOverlay() {
            service.collapsePanel()
        }

        @JavascriptInterface
        fun hideOverlay() {
            service.collapsePanel()
        }
    }
}
