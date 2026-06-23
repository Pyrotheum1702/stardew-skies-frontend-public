
import { CONFIG } from "../Config/Config";
import { GlobalVar } from "../Helper/GlobalVar";
import { callLoadingDialog } from "../Helper/Loading/LoadingDialog";
import SoundPlayer from "../Helper/SoundPlayer";
import Utils from "../Helper/Utils";
import AssetContainer from "../Main/AssetContainer";
import LoginPanel from "../Modules/Login/LoginPanel";
import { callTextNotification, TextNotificationBGColor } from "../Notification/TextNotification";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadController extends cc.Component {
   @property(cc.Node) canvas: cc.Node = null;
   @property(LoginPanel) loginPanel: LoginPanel = null;

   protected onLoad(): void {
      if (Utils.isRunningInRealTelegram()) {
         //@ts-ignore
         GlobalVar.webApp = window?.Telegram?.WebApp;
      }

      this.loginPanel.node.active = false;

      cc.director.preloadScene("Main");
      AssetContainer.ins.canvas = this.canvas;

      this.loginPanel.onLoginSuccess = () => { cc.director.loadScene('Main') };

      const errorQuery = this.getErrorParam();
      if (errorQuery) {
         const message = this.getMessageParam();
         callTextNotification(5, message || `Unknown error!`, TextNotificationBGColor.RED);

         this.scheduleOnce(() => { Utils.fadeInNode(this.loginPanel.node); }, 3);
         return;
      }

      this.loginPanel.node.active = true;
      // if (location.origin.includes('localhost')) this.loginPanel.loginWithSessionToken(`pyro-test-unit-${Utils.random(1, 1000)}`);
      if (location.origin.includes('localhost')) this.loginPanel.loginWithSessionToken(`1111`);
   }

   private getErrorParam() {
      const urlParams = new URLSearchParams(window.location.search);
      const error = urlParams.get('error');
      // console.log({ token: error });
      return error;
   }

   private getMessageParam() {
      const urlParams = new URLSearchParams(window.location.search);
      const message = urlParams.get('message');
      // console.log({ message });
      return message;
   }
}