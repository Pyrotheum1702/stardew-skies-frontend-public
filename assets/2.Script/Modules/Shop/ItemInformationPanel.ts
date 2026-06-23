import { REQUEST_OPERATION, CONFIG } from "../../Config/Config";
import { GlobalVar } from "../../Helper/GlobalVar";
import { callLoadingDialog } from "../../Helper/Loading/LoadingDialog";
import Utils from "../../Helper/Utils";
import GardenAssetManager from "../../Main/Farming/GardenAssetManager";
import { SERVER_DYNAMIC_CONFIGURATIONS } from "../../Main/Item";
import ProfileInfoManager from "../../Main/Profile/ProfileInfoManager";
import { callTextNotification, TextNotificationBGColor } from "../../Notification/TextNotification";
import InventoryBar from "../InventoryBar/InventoryBar";
import { SHOP_PAGE } from "./Shop";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ItemInformationPanel extends cc.Component {
   @property(cc.Node) backgroundOverlay: cc.Node = null;
   @property(cc.Label) nameLb: cc.Label = null;
   @property(cc.Label) timeLb: cc.Label = null;
   @property(cc.Label) levelLb: cc.Label = null;
   @property(cc.Label) rewardLb: cc.Label = null;

   @property(cc.Label) costLb: cc.Label = null;
   @property(cc.Label) noticeLb: cc.Label = null;

   @property(cc.EditBox) buyAmountEditBox: cc.EditBox = null;

   @property([cc.Sprite]) plantIconSprs: cc.Sprite[] = [];

   currentPage: any = null;
   itemData: any = null;
   blockAllAction = false;
   onExitCallback = null;

   protected onLoad(): void {
      this.buyAmountEditBox.node.on('text-changed', this.onEditBoxTextChanged, this);
      this.backgroundOverlay.on(cc.Node.EventType.TOUCH_END, this.onClickExit, this);
      cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event) => {
         if (event.keyCode === cc.macro.KEY.escape) this.onClickExit();
      }, this);
   }

   private onEditBoxTextChanged(editBox): void {
      const amount = Math.round(Math.min(999, Math.max(1, parseFloat(this.buyAmountEditBox.string))))
      this.buyAmountEditBox.string = amount.toString();
      this.costLb.string = `${amount * this.itemData.cost}`;
   }

   initData(data, page) {
      const ITEMS = SERVER_DYNAMIC_CONFIGURATIONS.ITEMS;
      const item = ITEMS[data.itemID];

      this.itemData = data;

      const defaultCount = 1;

      this.buyAmountEditBox.string = `${defaultCount}`;

      this.costLb.string = `${defaultCount * data.cost}`;
      this.nameLb.string = data.name;

      this.currentPage = page;
      switch (page) {
         case SHOP_PAGE.SEED: {
            this.timeLb.string = `Time: ${Utils.parseTimeToReadableString2(item?.growthTime * 1000) || `???`}`;
            this.levelLb.string = `Level: ${item?.level}`;
            this.rewardLb.string = `Reward: ${item?.yields?.coin}`;

            this.plantIconSprs.forEach(spr => { spr.spriteFrame = GardenAssetManager.ins.plantMaturedSprFrames[item.spriteIndex || 0]; });
            break;
         }
         case SHOP_PAGE.POT: {
            const timeReducePercentage = Math.round(item.timeReduce * 100);

            this.levelLb.node.parent.active = false;
            this.rewardLb.node.parent.active = false;

            this.timeLb.string = `Time: -${timeReducePercentage}%`;

            if (item.timeReduce <= 0) this.timeLb.string = `: 0%`;
            this.noticeLb.string = `${item.name} reduces the time it takes for a plant to mature by ${timeReducePercentage}%`;
            if (timeReducePercentage <= 0) this.noticeLb.string = `${item.name} is the most basic pot for planting.`;

            this.plantIconSprs.forEach(spr => { spr.spriteFrame = GardenAssetManager.ins.potSprFrames[item.spriteIndex || 0]; });
            break;
         }
         case SHOP_PAGE.FERTILIZER: {
            const timeReducePercentage = Math.round(item.timeReduce * 100);

            this.levelLb.node.parent.active = false;
            this.rewardLb.node.parent.active = false;


            this.timeLb.string = `Time: -${timeReducePercentage}%`;
            if (item.timeReduce <= 0) this.timeLb.string = `: 0%`;
            this.noticeLb.string = `${item.name} reduces the time it takes for a plant to mature by ${timeReducePercentage}%

Note: You can only fertilize a plant once.`;

            this.plantIconSprs.forEach(spr => { spr.spriteFrame = GardenAssetManager.ins.fertilizerSprFrames[item.spriteIndex || 0]; });
            break;
         }
      }
   }

   onClickIncr() {
      if (this.blockAllAction) return;
      const amount = Math.round(Math.min(999, parseFloat(this.buyAmountEditBox.string) + 1));
      this.buyAmountEditBox.string = amount.toString();
      this.costLb.string = `${amount * this.itemData.cost}`;
   }

   onClickDecr() {
      if (this.blockAllAction) return;
      const amount = Math.round(Math.max(1, parseFloat(this.buyAmountEditBox.string) - 1))
      this.buyAmountEditBox.string = amount.toString();
      this.costLb.string = `${amount * this.itemData.cost}`;
   }

   onClickBuy() {
      if (this.blockAllAction) return;

      let targetBuyAmount = parseInt(this.buyAmountEditBox.string);

      if (isNaN(targetBuyAmount)) throw new Error(`invalid buy amount`);

      // console.log({ targetBuyAmount });

      let loading = callLoadingDialog(15, () => {
         callTextNotification(4, `Timeout!`, TextNotificationBGColor.RED)
      })

      Utils.sendRequest({
         operation: REQUEST_OPERATION.MAKE_SHOP_PURCHASE,
         page: this.currentPage,
         buyAmount: targetBuyAmount,
         productID: this.itemData.productID,
      }, (response) => {
         // console.log({ response });

         GlobalVar.profile = response.profile;
         GlobalVar.inventory = response.inventory;

         ProfileInfoManager.ins.updateProfileInfo();
         InventoryBar.ins.reloadInventory();

         callTextNotification(2, `+${(Math.round(response?.product?.quantity * response?.purchaseAmount)) || '?'} ${response?.product?.name || `Unknown`}`, TextNotificationBGColor.GREEN);

         loading.endImmediately();
      }, (error) => {
         console.error({ error });

         callTextNotification(4, error?.message || "Unknown error!", TextNotificationBGColor.RED)
         loading.endImmediately();
      })
   }

   onClickExit() {
      if (this.blockAllAction) return;
      this.blockAllAction = true;
      Utils.fadeOutNode(this.node, 0.25, null, true);
      this.onExitCallback?.();
   }
}

