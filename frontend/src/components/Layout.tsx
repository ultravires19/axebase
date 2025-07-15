import { JSX } from "solid-js";
import { Suspense } from "solid-js";
import Navigation from "./Navigation";

interface LayoutProps {
  children: JSX.Element;
}

export default function Layout(props: LayoutProps) {
  return (
    <div>
      <Navigation />

      <main class="flex-grow">
        <Suspense
          fallback={
            <div class="flex justify-center items-center h-full min-h-[50vh]">
              <div class="animate-pulse flex flex-col items-center">
                <div class="rounded-full bg-gray-200 h-12 w-12 mb-4"></div>
                <div class="h-2 bg-gray-200 rounded w-48 mb-4"></div>
                <div class="h-2 bg-gray-200 rounded w-40"></div>
              </div>
            </div>
          }
        >
          {props.children}
        </Suspense>
      </main>

      <footer class="bg-white border-t border-gray-200 py-4">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p class="text-center text-sm text-gray-500">
            AxeBase Starter Kit &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
