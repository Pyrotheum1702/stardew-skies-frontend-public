import { REQUEST_OPERATION } from "../../Config/Config";
import { GlobalVar } from "../../Helper/GlobalVar";
import { callLoadingDialog, callInvisibleLoadingDialog } from "../../Helper/Loading/LoadingDialog";
import Utils from "../../Helper/Utils";
import AssetContainer from "../../Main/AssetContainer";
import { GardenAssetHelper } from "../../Main/Farming/GardenAssetManager";
import { SERVER_DYNAMIC_CONFIGURATIONS } from "../../Main/Item";
import ProfileInfoManager from "../../Main/Profile/ProfileInfoManager";
import { callTextNotification, TextNotificationBGColor } from "../../Notification/TextNotification";
import InventoryBar from "../InventoryBar/InventoryBar";
import LuckySpinSector from "./LuckySpinSector";

const { ccclass, property } = cc._decorator;

@ccclass
export default class LuckySpin extends cc.Component {

   @property(cc.Node) disk: cc.Node = null;
   @property(cc.Node) content: cc.Node = null;
   @property(cc.Node) wheelSectorContainer: cc.Node = null;
   @property(cc.Label) spinCountLb: cc.Label = null;
   @property(cc.Prefab) sectorPref: cc.Prefab = null;

   blockAllAction = false
   onClose = null

   spinCount = 0;
   wheelPrizes = [];
   wheelPrizeCount = 0;
   wheelCurrentSectorIndex = 0;

   updateSpinCount() {
      if (CC_DEV) console.log(GlobalVar.profile);

      const spinCount = GlobalVar.profile.luckySpin || 0;
      this.spinCount = spinCount;
      this.spinCountLb.string = `Spin: ${spinCount}`;
   }

   async fetchLuckySpinWheel() {
      return new Promise((resolve) => {
         this.blockAllAction = true;
         let loading = callLoadingDialog(15, () => {
            callTextNotification(4, "Timeout!", TextNotificationBGColor.RED);
            this.blockAllAction = false;
            this.onClickClose();
            resolve(null);
         })

         Utils.sendRequest({
            operation: REQUEST_OPERATION.GET_LUCKY_SPIN_WHEEL,
         }, (response) => {
            if (CC_DEV) console.log({ fetchLuckySpinWheel: response });

            this.blockAllAction = false;
            loading.endImmediately();
            resolve(response);
         }, (error) => {
            console.error({ error });
            callTextNotification(4, error?.message || "Unknown error!", TextNotificationBGColor.RED)
            this.blockAllAction = false;
            this.onClickClose();
            loading.endImmediately();
            resolve(null);
         })
      })
   }

   buildWheel(spinWheel) {
      if (!spinWheel) return;
      if (CC_DEV) console.log({ spinWheel });

      this.wheelSectorContainer.removeAllChildren(true);

      let sectorSpawnAngle = 0;
      const sectorOffset = 45;
      const prizes = spinWheel.prizes;
      if (!prizes) return;
      this.wheelPrizeCount = prizes.length;

      this.wheelPrizes = prizes;
      const ITEMS = SERVER_DYNAMIC_CONFIGURATIONS.ITEMS;
      this.wheelSectorContainer.angle = 0;
      this.wheelCurrentSectorIndex = 0;

      for (let i = 0; i < 8; i++) {
         const prize = prizes[i];

         let sector = cc.instantiate(this.sectorPref);
         sector.setParent(this.wheelSectorContainer);
         sector.setPosition(0, 0);
         sector.angle = sectorSpawnAngle;
         sectorSpawnAngle -= sectorOffset;

         const script = sector.getComponent(LuckySpinSector);

         sector.active = true;
         // sector.active = (prize);

         console.log({ prize });

         if (prize.count > 0) {
            const item = ITEMS[prize.itemID];
            script.rewardCountLb.string = `x${prize.count}`;
            const spr = script.rewardSpr;
            const sprFrame: cc.SpriteFrame = GardenAssetHelper.getItemSpriteFrame(prize.itemType, item?.spriteIndex);
            if (!sprFrame) { sector.active = false; continue; }
            // console.log(sprFrame.getTexture());

            spr.spriteFrame = sprFrame;
            // spr.node.setContentSize(spr.node.height * (sprFrame.getRect().width / sprFrame.getRect().height), spr.node.height);
            spr.node.setContentSize(spr.node.width, spr.node.width * (sprFrame.getRect().height / sprFrame.getRect().width));
         } else {
            script.rewardCountLb.string = `Lucky`
            script.rewardCountLb.node.x = 3;
            script.rewardCountLb.node.y += 25;
            const spr = script.rewardSpr;
            spr.spriteFrame = null;
         }
      }
   }

   protected onLoad(): void {
      this.updateSpinCount();
      this.fetchLuckySpinWheel().then((response: any) => {
         if (!response) return null;
         this.buildWheel(response?.spinWheel);
      });
   }

   private spin() {
      this.blockAllAction = true;
      let resolved = false;
      let loading = callInvisibleLoadingDialog(5, () => {
         callTextNotification(4, "Timeout!", TextNotificationBGColor.RED);
         this.blockAllAction = false;
         resolved = true;
      });

      Utils.mushroomBounceNode(this.content, 0.2, null, 0.015);

      Utils.sendRequest({
         operation: REQUEST_OPERATION.SPIN_LUCKY_WHEEL,
      }, (response) => {
         loading.endImmediately();
         if (resolved) { this.blockAllAction = false; return; }

         if (CC_DEV) console.log({ spin: response });

         const prizeCount = this.wheelPrizeCount;
         const prize = response.prize;
         const indexOfPrize = this.wheelPrizes.findIndex(obj => { return obj.prizeID == prize.prizeID; });
         if (indexOfPrize == null) { this.blockAllAction = false; return; }

         const currentIndex = this.wheelCurrentSectorIndex;
         let indexDistance = (indexOfPrize > currentIndex) ? (indexOfPrize - currentIndex) : (indexOfPrize + prizeCount - currentIndex);
         let angleDistance = indexDistance * 45 + (360 * Utils.random(3, 5));

         if (CC_DEV) console.log({ currentIndex, distance: indexDistance, angleDistance });
         const nextIndex = (currentIndex + indexDistance) % prizeCount;
         cc.tween(this.disk).to(2, { angle: this.disk.angle + angleDistance }, { easing: "sineOut" }).call(() => {
            this.blockAllAction = false;

            if (response.profile) {
               GlobalVar.profile = response.profile;
               ProfileInfoManager.ins.updateProfileInfo();
            }

            if (response.inventory) {
               GlobalVar.inventory = response.inventory;
               InventoryBar.ins.reloadInventory();
            }

            this.updateSpinCount();
            if (prize.count > 0) callTextNotification(2, `+${prize.count || '?'} ${prize.name || `Unknown` + ((prize.count > 1) ? "s" : "")}`, TextNotificationBGColor.GREEN);
         }).start();
         this.wheelCurrentSectorIndex = nextIndex;
      }, (error) => {
         if (resolved) return;
         console.error({ error });
         callTextNotification(4, error?.message || "Unknown error!", TextNotificationBGColor.RED)
         this.blockAllAction = false;
         this.onClickClose();
         loading.endImmediately();
      })
   }

   onClickSpin() {
      if (this.spinCount <= 0) return;

      if (this.blockAllAction) return;
      this.blockAllAction = true;

      this.spin();
   }

   onClickClose() {
      if (this.blockAllAction) return;
      this.blockAllAction = true;

      Utils.fadeOutNode(this.node, 0.25, () => { this.onClose?.(); }, true);
   }
}

export function callLuckySpin(onClickClose = null) {
   const asset = AssetContainer.ins;
   const pref = asset.luckySpinPref;

   let node = cc.instantiate(pref)
   node.setParent(cc.director.getScene().getChildByName('Canvas'))
   node.setPosition(cc.v2(0, 0))
   Utils.fadeInNode(node)

   let script = node.getComponent(LuckySpin)
   script.onClose = onClickClose
   return script
}