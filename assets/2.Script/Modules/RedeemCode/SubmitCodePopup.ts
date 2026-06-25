import Api from "../../Network/Api";
import { CONFIG, REQUEST_OPERATION } from "../../Config/Config";
import { GlobalVar } from "../../Helper/GlobalVar";
import { callLoadingDialog } from "../../Helper/Loading/LoadingDialog";
import Utils from "../../Helper/Utils";
import AssetContainer from "../../Main/AssetContainer";
import ProfileInfoManager from "../../Main/Profile/ProfileInfoManager";
import { callTextNotification, TextNotificationBGColor } from "../../Notification/TextNotification";
import InventoryBar from "../InventoryBar/InventoryBar";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RedeemCodePanel extends cc.Component {
   @property(cc.EditBox) submitCodeEditBox: cc.EditBox = null

   originY = 0
   blockAllAction = false

   onClose = null
   submitCode = ""

   protected onLoad(): void {
      this.submitCodeEditBox.node.on('text-changed', this.onEditCodeChange, this);
      this.submitCodeEditBox.node.on('editing-return', this.onEditCodeEnd, this);
      this.submitCodeEditBox.node.on('editing-did-ended', this.onEditCodeEnd, this);
      cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event) => {
         if (event.keyCode === cc.macro.KEY.escape) this.onClickClose();
      }, this);
   }

   onEditCodeChange(evt) {
      this.submitCode = this.submitCodeEditBox.string;
   }

   onEditCodeEnd(evt) {
      this.submitCode = this.submitCodeEditBox.string;
   }

   onClickClose() {
      if (this.blockAllAction) return
      this.blockAllAction = true

      Utils.fadeOutNode(this.node, 0.25, () => {
         this.onClose?.();
      }, true);
   }

   async onClickCheck() {
      if (this.blockAllAction) return
      this.blockAllAction = true
      const codeUse = this.submitCode
      let codeAnimation = this.submitCode

      if (this.submitCode.length < 5) {
         callTextNotification(5, `Invalid code length.`, TextNotificationBGColor.RED)
         this.blockAllAction = false
         return;
      }

      this.submitCode = ""

      let loading = callLoadingDialog(60, () => {
         this.blockAllAction = false
         callTextNotification(5, `Timeout!`, TextNotificationBGColor.RED)
         this.submitCodeEditBox.string = ""
      })

      Api.sendRequest({
         operation: REQUEST_OPERATION.SUBMIT_GIFT_CODE,
         code: codeUse
      }, (response) => {
         console.log({ response });
         if (response.message) callTextNotification(5, response.message, TextNotificationBGColor.GREEN);
         loading.endImmediately()
         this.blockAllAction = false;
         this.submitCodeEditBox.string = "";

         if (response.profile) {
            GlobalVar.profile = response.profile;
            ProfileInfoManager.ins.updateProfileInfo();
         }
         if (response.inventory) {
            GlobalVar.inventory = response.inventory;
            InventoryBar.ins.reloadInventory();
         }
      }, (error) => {
         loading.endImmediately()
         callTextNotification(5, error.message, TextNotificationBGColor.RED)
         this.blockAllAction = false
         this.submitCodeEditBox.string = ""
      })
   }
}


export function callGiftCodePopup(onClickClose = null) {
   const asset = AssetContainer.ins;
   const pref = asset.giftCodePopupPref;

   let dialog = cc.instantiate(pref)
   dialog.setParent(cc.director.getScene().getChildByName('Canvas'))
   dialog.setPosition(cc.v2(0, 0))
   Utils.fadeInNode(dialog)

   let script = dialog.getComponent(RedeemCodePanel)
   script.onClose = onClickClose
   return script
}