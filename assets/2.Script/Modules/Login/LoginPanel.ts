import { REQUEST_OPERATION, CONFIG } from "../../Config/Config";
import { GlobalVar } from "../../Helper/GlobalVar";
import { callLoadingDialog } from "../../Helper/Loading/LoadingDialog";
import LocalStorage from "../../Helper/LocalStorage";
import Utils from "../../Helper/Utils";
import { SERVER_DYNAMIC_CONFIGURATIONS } from "../../Main/Item";
import { callTextNotification, TextNotificationBGColor } from "../../Notification/TextNotification";


const { ccclass, property } = cc._decorator;

@ccclass
export default class LoginPanel extends cc.Component {
   @property(cc.Node) content: cc.Node = null;
   @property(cc.EditBox) usernameEditBox: cc.EditBox = null
   @property(cc.EditBox) passwordEditBox: cc.EditBox = null

   useUsername = ""
   usePassword = ""
   onLoginSuccess = null;
   blockAllAction = false;

   protected onLoad(): void {
      // LocalStorage.setItem('ShownTutorial1', false);
      // LocalStorage.setItem('ShownTutorial2', false);
      // LocalStorage.setItem('ShownTutorial3', false);

      cc.director.preloadScene('Main');

      const isTelegramWebapp = (GlobalVar.webApp != null);
      if (isTelegramWebapp) {
         this.content.active = false;
         return this.loginWithTelegram();
      }
      this.checkLoginWithToken();

      if (CC_DEV) console.log({ 'window.location': window.location.host })
   }

   private checkLoginWithToken() {
      const token = this.getTokenParam();
      if (token) this.loginWithSessionToken(token);
   }

   private getTokenParam() {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      return token;
   }

   private getRefParam() {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('ref');
      return token;
   }

   loginWithTelegram() {
      let loading = callLoadingDialog(15, () => {
         // openSceneLoad()
         callTextNotification(4, "Timeout!", TextNotificationBGColor.RED);
         console.error("LOGIN TIMEOUT!");

         Utils.fadeInNode(this.node);
      })

      const refCode = this.getRefParam();
      Utils.sendRequest({
         operation: REQUEST_OPERATION.LOGIN_TELEGRAM,
         initAppData: GlobalVar.webApp.initData,
         refCode: refCode,
      }, (response) => {
         try {
            this.blockAllAction = false;
            loading.endImmediately();

            if (CC_DEV) console.log({ loginUserData: response });
            GlobalVar.profile = response.profile;
            GlobalVar.inventory = response.inventory;
            GlobalVar.accessToken = response.accessToken;
            const itemConfig = JSON.parse(response.itemConfig);
            if (CC_DEV) console.log({ itemConfig });

            if (response.profile.new == true) {
               LocalStorage.setItem('ShownTutorial1', false);

               LocalStorage.setItem('ShownTutorial2', false);

               LocalStorage.setItem('ShownTutorial3', false);
            }

            SERVER_DYNAMIC_CONFIGURATIONS.ITEMS = itemConfig;

            this.onLoginSuccess?.()
         } catch (error) {
            callTextNotification(4, error?.toString() || "Unknown error!", TextNotificationBGColor.RED);
         }
      }, (error) => {
         this.blockAllAction = false;

         loading.endImmediately();
         callTextNotification(4, error?.message || "Unknown error!", TextNotificationBGColor.RED);
         Utils.fadeInNode(this.node);
      })
   }

   loginWithSessionToken(sessionToken) {
      if (CC_DEV) console.log({ loginWithSessionToken: sessionToken });

      this.node.active = false;

      let loading = callLoadingDialog(15, () => {
         // openSceneLoad()
         callTextNotification(4, "Timeout!", TextNotificationBGColor.RED);
         console.error("LOGIN TIMEOUT!");

         Utils.fadeInNode(this.node);
      })

      const refCode = this.getRefParam();
      Utils.sendRequest({
         operation: REQUEST_OPERATION.LOGIN,
         sessionToken: sessionToken,
         refCode: refCode,
      }, (response) => {
         try {
            this.blockAllAction = false;
            loading.endImmediately();

            if (CC_DEV) console.log({ loginUserData: response });
            GlobalVar.profile = response.profile;
            GlobalVar.inventory = response.inventory;
            GlobalVar.accessToken = response.accessToken;
            const itemConfig = JSON.parse(response.itemConfig);
            if (CC_DEV) console.log({ itemConfig });

            if (response.profile.new == true) {
               LocalStorage.setItem('ShownTutorial1', false);

               LocalStorage.setItem('ShownTutorial2', false);

               LocalStorage.setItem('ShownTutorial3', false);
            }

            SERVER_DYNAMIC_CONFIGURATIONS.ITEMS = itemConfig;

            this.onLoginSuccess?.()
         } catch (error) {
            callTextNotification(4, error?.toString() || "Unknown error!", TextNotificationBGColor.RED);
         }
      }, (error) => {
         this.blockAllAction = false;

         loading.endImmediately();
         callTextNotification(4, error?.message || "Unknown error!", TextNotificationBGColor.RED);
         Utils.fadeInNode(this.node);
      })
   }

   async loginWTwitter() {
      if (this.blockAllAction) return;
      this.blockAllAction = true;

      let loading = callLoadingDialog(15, () => {
         this.blockAllAction = false;
         callTextNotification(4, 'Timeout!', TextNotificationBGColor.RED);
      })

      this.loginWithTwitter().then(() => {
         this.blockAllAction = false;
         loading.endImmediately();
      });
   }

   // Helper method to register events for each EditBox
   private registerEditBoxEvents(editBox: cc.EditBox): void {
      editBox.node.on('editing-did-began', this.onEditBoxDidBegin, this);
      editBox.node.on('text-changed', this.onEditBoxTextChanged, this);
      editBox.node.on('editing-did-ended', this.onEditBoxDidEnd, this);
   }

   private onEditBoxDidBegin(editBox): void {
      switch (editBox) {
         case this.usernameEditBox: {
            // if(CC_DEV)console.log(`Editing started in this.usernameEditBox`);
            break;
         }
         case this.passwordEditBox: {
            // if(CC_DEV)console.log(`Editing started in this.passwordEditBox`);
            break;
         }
      }
   }

   private onEditBoxTextChanged(editBox): void {
      switch (editBox) {
         case this.usernameEditBox: {
            this.onUsernameChange(this.usernameEditBox.string)
            // if(CC_DEV)console.log(`Text changed in this.usernameEditBox`);
            break;
         }
         case this.passwordEditBox: {
            this.onPasswordChange(this.passwordEditBox.string)
            // if(CC_DEV)console.log(`Text changed in this.passwordEditBox`);
            break;
         }
      }
   }

   private onEditBoxDidEnd(editBox): void {
      switch (editBox) {
         case this.usernameEditBox: {
            this.onUsernameChange(this.usernameEditBox.string)
            // if(CC_DEV)console.log(`Editing ended in this.usernameEditBox`);
            break;
         }
         case this.passwordEditBox: {
            this.onPasswordChange(this.passwordEditBox.string)
            // if(CC_DEV)console.log(`Editing ended in this.passwordEditBox`);
            break;
         }
      }
   }

   onUsernameChange(string) {
      // if(CC_DEV)console.log("onUsernameChange", string);
      this.useUsername = string
   }

   onPasswordChange(string) {
      // if(CC_DEV)console.log("onPasswordChange", string);
      this.usePassword = string
   }

   onClickContinue() {
      // if (this.blockAllAction) return;
      // this.blockAllAction = true;

      // if (this.useUsername.length <= 1) return

      // if(CC_DEV)console.log({
      //    login: {
      //       username: this.useUsername,
      //       password: this.usePassword,
      //    }
      // });

      // const loginData = {
      //    username: this.useUsername,
      //    password: this.usePassword
      // }

      // this.login(loginData);
   }

   async loginWithTwitter(onComplete = null, onError = null) {
      try {
         const ref = this.getRefParam();
         const url = `${window.location.origin}/api/login/twitter${ref ? `?refCode=${encodeURIComponent(ref)}` : ''}`;
         window.location.href = url;
      } catch (err) {
         console.error('Twitter login failed:', err);
         if (onError) onError(err);
      }
   }
}
