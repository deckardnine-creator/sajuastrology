package com.rimfactory.sajuastrology;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    @SuppressWarnings("deprecation")
    public void onBackPressed() {
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null && webView.canGoBack()) {
                webView.goBack();
                return;
            }
        } catch (Exception ignored) {}

        // Fallback: use JS history
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                webView.evaluateJavascript(
                    "if(window.history.length > 1) { window.history.back(); 'ok'; } else { 'exit'; }",
                    value -> {
                        if ("\"exit\"".equals(value)) {
                            runOnUiThread(() -> MainActivity.super.onBackPressed());
                        }
                    }
                );
                return;
            }
        } catch (Exception ignored) {}

        super.onBackPressed();
    }
}
