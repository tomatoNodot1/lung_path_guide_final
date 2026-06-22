import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { GameStateProvider, useGameState } from "../lib/game-state";
import { Volume2, VolumeX } from "lucide-react";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "LungCancerScreen" },
      { name: "description", content: "Lung Health Journey is a mobile web app for lung cancer screening education and decision-making." },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "LungCancerScreen" },
      { property: "og:description", content: "Lung Health Journey is a mobile web app for lung cancer screening education and decision-making." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" },
      { name: "twitter:title", content: "LungCancerScreen" },
      { name: "twitter:description", content: "Lung Health Journey is a mobile web app for lung cancer screening education and decision-making." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1ebf3415-5420-4cad-bff3-c946fdc0f9c2/id-preview-e136de00--46cad294-d088-430c-a514-8e410e9abb1a.lovable.app-1782114933868.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1ebf3415-5420-4cad-bff3-c946fdc0f9c2/id-preview-e136de00--46cad294-d088-430c-a514-8e410e9abb1a.lovable.app-1782114933868.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <GameStateProvider>
        <AppShell>
          <Outlet />
        </AppShell>
      </GameStateProvider>
    </QueryClientProvider>
  );
}

function AppShell({ children }: { children: ReactNode }) {
  const { muted, toggleMuted } = useGameState();

  // ====== 优化后的全局点击音效逻辑 ======
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      if (muted) return; // 如果静音则不播

      const target = e.target as HTMLElement;
      // 检查点击的是不是可交互元素
      if (
        target.closest('button') || 
        target.closest('a') || 
        target.closest('[role="button"]') || 
        target.closest('.cursor-pointer')
      ) {
        // 直接从页面上找到那个 audio 标签来播放
        const clickAudio = document.getElementById('global-click-audio') as HTMLAudioElement;
        if (clickAudio) {
          clickAudio.currentTime = 0; // 重置进度，支持连续点击
          clickAudio.volume = 0.4;
          // 这里的 play 浏览器极少拦截，因为它是由真实的点击事件直接触发的
          clickAudio.play().catch(err => console.log('Audio blocked:', err)); 
        }
      }
    };

    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, [muted]);
  // ===================================

  return (
    <div className="min-h-[100dvh] w-full bg-[#fcfbf8] text-slate-900">
      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[480px] flex-col px-5 pb-8 pt-6">
        
        {/* 把音频播放器实打实地放在页面里，但不显示出来 */}
        <audio id="global-click-audio" src="/effect_click.mp3" preload="auto" />

        <button
          type="button"
          onClick={toggleMuted}
          aria-label={muted ? "开启语音" : "关闭语音"}
          className="absolute right-4 top-4 z-50 inline-flex h-12 items-center gap-2 rounded-full bg-white px-4 text-base font-bold shadow-md ring-1 ring-slate-200 active:scale-95"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          <span>语音：{muted ? "关" : "开"}</span>
        </button>
        {children}
      </div>
    </div>
  );
}

