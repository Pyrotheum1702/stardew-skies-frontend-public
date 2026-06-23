const { ccclass, property } = cc._decorator;

export const SEED_ID_TO_SPRITE_FRAME_INDEX: any = {
   '9001': 0,
   '9002': 1,
   '9003': 2,
}

@ccclass
export default class AssetContainer extends cc.Component {
   canvas: cc.Node = null
   @property(cc.Prefab) loadingPopUp: cc.Prefab = null;
   @property(cc.Prefab) loadingDialogPref: cc.Prefab = null;
   @property(cc.Prefab) confirmDialogPref: cc.Prefab = null;
   @property(cc.Prefab) giftCodePopupPref: cc.Prefab = null;
   @property(cc.Prefab) luckySpinPref: cc.Prefab = null;

   @property(cc.Prefab) lvlUpDialogPref: cc.Prefab = null;
   @property(cc.Prefab) tutorialDialogPref: cc.Prefab = null;
   @property(cc.Prefab) nonBlockingTutorialDialogPref: cc.Prefab = null;
   @property(cc.Prefab) textNotificationPref: cc.Prefab = null;
   @property(cc.Prefab) floatingTextPref: cc.Prefab = null;
   @property(cc.Prefab) actionBlocker: cc.Prefab = null;
   @property(cc.Prefab) highlighPref: cc.Prefab = null;
   @property(cc.Prefab) highligh2Pref: cc.Prefab = null;

   @property(cc.Prefab) shopPref: cc.Prefab = null;
   @property(cc.Prefab) taskPref: cc.Prefab = null;
   @property(cc.Prefab) friendPref: cc.Prefab = null;
   @property(cc.Prefab) inventoryPref: cc.Prefab = null;
   @property(cc.Prefab) leaderboardPref: cc.Prefab = null;

   // @property(cc.Prefab) blockInformationPopup: cc.Prefab = null 

   // @property(cc.Prefab) confirmationPopup: cc.Prefab = null
   // @property(cc.Prefab) inviteFriendPopup: cc.Prefab = null

   // @property(cc.Prefab) notificationPopupPref: cc.Prefab = null

   // @property([cc.SpriteFrame]) rankIcons: cc.SpriteFrame[] = []

   public static ins: AssetContainer = null

   protected onLoad() {
      if (AssetContainer.ins) return this.node.destroy();

      console.log('[AssetContainer] onLoad');

      AssetContainer.ins = this;
      cc.game.addPersistRootNode(this.node);
   }

   protected start(): void {
      console.log('[AssetContainer] start');
   }

   protected onDestroy(): void {
      console.log('[AssetContainer] onDestroy');
   }
}
