import { useEffect, useState } from "react";
import { Download, Share2, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "pwa-install-dismissed-v1";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone ===
      true
  );
}

function isIosSafari() {
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(userAgent);
  const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios/.test(userAgent);
  return isIos && isSafari;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === "true") {
      return;
    }

    if (isIosSafari()) {
      setShowIosHint(true);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setShowPrompt(true);
      setShowIosHint(false);
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      setShowIosHint(false);
      localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) {
      return;
    }

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;

    if (choice.outcome === "accepted") {
      setShowPrompt(false);
      localStorage.removeItem(DISMISS_KEY);
    }

    setDeferredPrompt(null);
  }

  function dismissPrompt() {
    localStorage.setItem(DISMISS_KEY, "true");
    setShowPrompt(false);
    setShowIosHint(false);
  }

  if (!showPrompt && !showIosHint) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:w-full sm:max-w-md">
      <div className="rounded-2xl border bg-background/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] shadow-xl backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            {showIosHint ? (
              <Smartphone className="h-5 w-5" />
            ) : (
              <Download className="h-5 w-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-semibold">Install Cost Flow</p>
            {showIosHint ? (
              <p className="mt-1 text-sm text-muted-foreground">
                On iPhone or iPad, tap <Share2 className="mx-1 inline h-3.5 w-3.5 align-[-2px]" />
                in Safari, then choose <span className="font-medium text-foreground">Add to Home Screen</span>.
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted-foreground">
                Install the app for a faster mobile and desktop experience with
                home-screen access.
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={dismissPrompt}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" className="w-full sm:w-auto" onClick={dismissPrompt}>
            Not now
          </Button>
          {!showIosHint && (
            <Button className="w-full sm:w-auto" onClick={handleInstall}>
              Install app
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
