import { ENV } from "../Config/Config";
import { GlobalVar } from "../Helper/GlobalVar";

export interface ApiResponse {
   status?: number;
   [key: string]: any;
}

type ApiCallback = (data: ApiResponse) => void;

/**
 * Network layer for the backend API.
 *
 * All gameplay requests go through {@link Api.sendRequest}, which attaches the
 * current session (uuid + access token) and dispatches a single POST to the
 * backend request endpoint. Endpoint and timeout come from {@link ENV.API}.
 *
 * The method both resolves with the response and invokes the optional
 * `onComplete` / `onError` callbacks, so existing callback-style call sites and
 * newer `await`-style call sites are both supported:
 *
 * ```ts
 * Api.sendRequest(param, res => {...}, err => {...}); // callback style
 * const res = await Api.sendRequest(param);           // async style
 * ```
 */
export default class Api {
   /** Returns a copy of `param` with the current session credentials attached. */
   private static withSession(param: any): any {
      const body = { ...param };
      if (GlobalVar.profile?.uuid) body.uuid = GlobalVar.profile.uuid;
      if (GlobalVar.accessToken) body.accessToken = GlobalVar.accessToken;
      return body;
   }

   /** Guards against stacking scene reloads when several 401s land at once. */
   private static reauthing = false;

   /** HTTP 401 = expired session: return to the Load scene to re-login, once. */
   private static handleUnauthorized() {
      if (Api.reauthing) return;
      Api.reauthing = true;
      console.log("session expired (401) — returning to login.");
      cc.director.loadScene("Load", () => { Api.reauthing = false; });
   }

   private static parseBody(text: string): ApiResponse {
      if (!text) return {};
      try {
         return JSON.parse(text);
      } catch (e) {
         console.log("Err :", e);
         return {};
      }
   }

   public static async sendRequest(
      param: any = null,
      onComplete: ApiCallback = null,
      onError: ApiCallback = null,
   ): Promise<ApiResponse | null> {
      if (param == null) {
         const error = { message: "request parameter is empty." };
         if (onError) onError(error);
         return null;
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), ENV.API.timeoutMs);

      try {
         const response = await fetch(ENV.API.url, {
            method: "POST",
            headers: { "Content-type": "application/json; charset=UTF-8" },
            body: JSON.stringify(Api.withSession(param)),
            signal: controller.signal,
         });

         const data = Api.parseBody(await response.text());
         data.status = response.status;

         // Expired session: bounce to login centrally and skip the call site's
         // own handling (its scene is about to unload anyway).
         if (response.status === 401) {
            Api.handleUnauthorized();
            return data;
         }

         if (response.status >= 200 && response.status < 400) {
            if (onComplete) onComplete(data);
         } else if (onError) {
            onError(data);
         }
         return data;
      } catch (e) {
         const message = e && e.name === "AbortError"
            ? "Timeout!"
            : "Can not connect to the server!";
         console.log("send request error:", e);
         if (onError) onError({ message });
         return null;
      } finally {
         clearTimeout(timeout);
      }
   }
}
