import { REQUEST_OPERATION } from "../../Config/Config";
import { TASK_STATE } from "../../Config/Constant";
import { GlobalVar } from "../../Helper/GlobalVar";
import { callLoadingDialog } from "../../Helper/Loading/LoadingDialog";
import Utils from "../../Helper/Utils";
import AssetContainer from "../../Main/AssetContainer";
import GardenController from "../../Main/GardenController";
import ProfileInfoManager from "../../Main/Profile/ProfileInfoManager";
import { callTextNotification, TextNotificationBGColor } from "../../Notification/TextNotification";
import LeaderboardItem from "./LeaderboardItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Leaderboard extends cc.Component {
   public static ins: Leaderboard = null;

   @property(cc.Node) overlayBG: cc.Node = null;
   @property(cc.Node) leaderboardItemContainer: cc.Node = null;

   @property(cc.ScrollView) scrollView: cc.ScrollView = null;

   @property(cc.Prefab) leaderboardItemPref: cc.Prefab = null;

   @property(cc.Sprite) myRankTopSpr: cc.Sprite = null;
   @property(cc.Sprite) myRankAvatarSpr: cc.Sprite = null;

   @property([cc.Label]) myRankLbs: cc.Label[] = [];
   @property([cc.SpriteFrame]) topSprFrames: cc.SpriteFrame[] = [];
   @property([cc.SpriteFrame]) avatarSprFrames: cc.SpriteFrame[] = [];

   leaderboardRankData = {};
   leaderboardItems = {};

   blockAllAction = false;
   initFetchedLeaderboard = false;

   public static get Instance(): Leaderboard {
      if (Leaderboard.ins == null) {
         const asset = AssetContainer.ins;

         let leaderboard = cc.instantiate(asset.leaderboardPref);
         leaderboard.setParent(asset.canvas)
         leaderboard.setPosition(0, 0);
         leaderboard.opacity = 0;
         leaderboard.active = false;

         Leaderboard.ins = leaderboard.getComponent(Leaderboard);
      }

      return Leaderboard.ins;
   }

   public reloadLeaderboard(taskData = null) {
      this.blockAllAction = true;
      let loading = callLoadingDialog(15, () => {
         callTextNotification(4, `Timeout!`, TextNotificationBGColor.RED);
      })

      let onResponse = (response) => {
         if (CC_DEV) console.log({ response });

         this.updateLeaderboardItems(response.top100, response.userRank);

         loading.endImmediately();
         this.blockAllAction = false;
         this.initFetchedLeaderboard = true;
      }

      if (taskData) {
         onResponse(taskData);
      } else Utils.sendRequest({
         operation: REQUEST_OPERATION.GET_LEADERBOARD,
      }, (response) => {
         onResponse(response);
      }, (error) => {
         console.error({ error });

         callTextNotification(4, error?.message || "Unknown error!", TextNotificationBGColor.RED);
         loading.endImmediately();
         this.blockAllAction = false;
      });
   }

   private updateLeaderboardItems(leaderboardData, userRank) {
      try {
         for (let i = 0; i < Object.keys(leaderboardData).length; i++) {
            this.scheduleOnce(() => {
               const key = Object.keys(leaderboardData)[i];
               let itemData = leaderboardData[key];

               if (!this.leaderboardItems[key]) {
                  let item = cc.instantiate(this.leaderboardItemPref).getComponent(LeaderboardItem);
                  this.leaderboardItems[key] = item;

                  item.node.setParent(this.leaderboardItemContainer);

                  let eventHandler = new cc.Button.EventHandler();
                  eventHandler.target = this.node;
                  eventHandler.component = 'Leaderboard';
                  eventHandler.handler = 'onClickLeaderboard';
                  eventHandler.customEventData = key;
               }

               let item: LeaderboardItem = this.leaderboardItems[key];
               this.leaderboardRankData[key] = itemData;

               item.nameLb.string = Utils.truncateString(itemData.name || '..', 15);
               item.rankLb.string = `#${itemData.rank || '..'}`;
               item.pointLb.string = itemData.point || '..';
               item.levelLb.string = `Lv${itemData.level || '?'}`;
               item.avatarSpr.spriteFrame = this.avatarSprFrames[itemData.avatarIndex];

               item.topSpr.node.active = (itemData.rank < 4);
               item.rankLb.node.active = !(itemData.rank < 4);
               if (itemData.rank < 4) item.topSpr.spriteFrame = this.topSprFrames[itemData.rank - 1];

               item.setScrollView(this.scrollView.node);
               item.onClickCallback = () => { this.onClickLeaderboardItem(itemData); };
            }, 0.1);
         }

         this.myRankLbs[0].string = `#${userRank.rank || '..'}`;
         this.myRankLbs[1].string = Utils.truncateString(userRank.name || '..', 15);
         this.myRankLbs[2].string = userRank.point || '..';
         this.myRankLbs[3].string = `Lv${userRank.level || '?'}`;
         this.myRankAvatarSpr.spriteFrame = this.avatarSprFrames[userRank.avatarIndex || 0];

         const r = userRank.rank;
         this.myRankTopSpr.node.active = (r < 4);
         this.myRankLbs[0].node.active = !(r < 4);
         if (r < 4) this.myRankTopSpr.spriteFrame = this.topSprFrames[r - 1];

      } catch (error) { console.error('[updateLeaderboardItems]', error); }
   }

   public showLeaderboard() {
      this.blockAllAction = true;

      Utils.fadeInNode(this.node, 0.25);
      this.scheduleOnce(() => { this.blockAllAction = false; }, 0.25);

      // return this.reloadLeaderboard();
      if (!this.initFetchedLeaderboard) {
         this.reloadLeaderboard();
         this.initFetchedLeaderboard = true;
      }
   }

   public hideLeaderboard() {
      if (this.blockAllAction) return;
      this.blockAllAction = true;

      if (this.node.active == true) Utils.fadeOutNode(this.node, 0.25, () => { });
      this.scheduleOnce(() => { this.blockAllAction = false; }, 0.25);
   }

   protected onLoad(): void {
      this.overlayBG.on(cc.Node.EventType.TOUCH_END, this.onClickLeaderboardOverlayBG, this)
      cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event) => {
         if (event.keyCode === cc.macro.KEY.escape) this.hideLeaderboard();
      }, this);
   }

   onClickLeaderboardItem(itemData) {
      // console.log({ onClickLeaderboardItem: itemData });
      this.hideLeaderboard();
      GardenController.ins.spectateGarden(itemData.uuid);
   }

   private onClickLeaderboardOverlayBG() { this.hideLeaderboard(); }
   protected onDestroy(): void { Leaderboard.ins = null; }
}
