import { callLoadingDialog } from "../../Helper/Loading/LoadingDialog";
import Utils from "../../Helper/Utils";
import Leaderboard from "../../Modules/Leaderboard/Leaderboard";
import { callLuckySpin } from "../../Modules/LuckySpin/LuckySpin";
import { callGiftCodePopup } from "../../Modules/RedeemCode/SubmitCodePopup";
import Shop from "../../Modules/Shop/Shop";
import Task from "../../Modules/Task/Task";
import GardenController from "../GardenController";
import { GLOBAL_EVENTS } from "../System/GlobalEvent";

const { ccclass, property } = cc._decorator;

export enum UI_VIEW_MODE {
   NORMAL,
   SPECTATING,
}

@ccclass
export default class UIController extends cc.Component {
   public static ins: UIController = null;
   @property(cc.Node) uiElementsContainer: cc.Node = null;

   uiElements: cc.Node[] = [];
   @property([cc.Node]) mainUIElements: cc.Node[] = [];
   @property([cc.Node]) spectatingUIElements: cc.Node[] = [];

   blockAllActions = false;
   currentViewMode: UI_VIEW_MODE = null;

   protected onLoad(): void {
      UIController.ins = this;
      this.blockAllActions = false;
      this.uiElements = this.uiElementsContainer.children;

      const shopNode = Shop.Instance.node;
      shopNode.setParent(this.uiElementsContainer);
      shopNode.setPosition(0, 0);
      this.setUIViewMode(UI_VIEW_MODE.NORMAL);
   }

   private temporaryBlockActions(duration = 0.88) {
      this.blockAllActions = true;
      this.scheduleOnce(() => {
         this.blockAllActions = false;
         console.log({ released: this.blockAllActions });
      }, duration);
   }

   onClickShopBtn() {
      console.log(`onClickShopBtn`);
      if (this.blockAllActions) return;
      this.temporaryBlockActions();

      cc.systemEvent.emit(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI);
      Shop.Instance.showShop();
   }

   onClickTaskBtn() {
      console.log(`onClickTaskBtn`);
      console.log(this.blockAllActions);
      if (this.blockAllActions) return;
      this.temporaryBlockActions();

      cc.systemEvent.emit(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI);
      Task.Instance.showTask();
   }

   onClickFriendBtn() {
      // if (this.blockAllActions) return;
      // this.temporaryBlockActions();

      // cc.systemEvent.emit(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI);
      // Friend.Instance.showFriend();
   }

   onClickLogout() {
      if (this.blockAllActions) return;
      this.temporaryBlockActions();

      callLoadingDialog(1, () => {
         const url = window.location.origin + window.location.pathname;
         console.log({ url });
         window.location.href = url;
      })
   }

   onClickGiftCode() {
      console.log(`onClickGiftCode`);
      if (this.blockAllActions) return;
      this.temporaryBlockActions();

      callGiftCodePopup();
      cc.systemEvent.emit(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI);
   }

   onClickLuckySpin() {
      console.log(`onClickLuckySpin`);
      if (this.blockAllActions) return;
      this.temporaryBlockActions();

      callLuckySpin();
      cc.systemEvent.emit(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI);
   }

   onClickLeaderboard() {
      console.log(`onClickLeaderboard`);

      if (this.blockAllActions) return;
      this.temporaryBlockActions();

      Leaderboard.Instance.showLeaderboard();
      cc.systemEvent.emit(GLOBAL_EVENTS.CLEAR_ALL_INTERACTION_UI);
   }

   hideMainUIElements() {
      this.mainUIElements.forEach(node => { Utils.fadeOutNode(node); });
   }

   setUIViewMode(viewMode: UI_VIEW_MODE) {
      if (this.currentViewMode == viewMode) return;

      switch (viewMode) {
         case UI_VIEW_MODE.NORMAL: {
            this.mainUIElements.forEach(node => { Utils.fadeInNode(node); });
            this.spectatingUIElements.forEach(node => { if (node.active) Utils.fadeOutNode(node); }); break;
         } case UI_VIEW_MODE.SPECTATING: {
            this.mainUIElements.forEach(node => { if (node.active) Utils.fadeOutNode(node); });
            this.spectatingUIElements.forEach(node => { if (!node.active) Utils.fadeInNode(node); }); break;
         }
      }

      this.currentViewMode = viewMode;
   }

   onClickReturnHomeGarden() {
      if (this.blockAllActions) return;
      this.temporaryBlockActions();

      GardenController.ins.buildMyGarden();
      this.setUIViewMode(UI_VIEW_MODE.NORMAL);
   }

   getIsSpectating() {
      return this.currentViewMode == UI_VIEW_MODE.SPECTATING;
   }

   protected onDestroy(): void {
      UIController.ins = null;
   }
}
