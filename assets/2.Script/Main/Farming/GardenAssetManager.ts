import { ITEM_TYPE } from "../../Config/Constant";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GardenAssetManager extends cc.Component {
   @property(cc.SpriteFrame) seedSprFrame: cc.SpriteFrame = null;
   @property([cc.SpriteFrame]) potSprFrames: cc.SpriteFrame[] = [];
   @property([cc.SpriteFrame]) fertilizerSprFrames: cc.SpriteFrame[] = [];
   @property([cc.SpriteFrame]) plantAdultSprFrames: cc.SpriteFrame[] = [];
   @property([cc.SpriteFrame]) plantMaturedSprFrames: cc.SpriteFrame[] = [];
   @property([cc.SpriteFrame]) alertSprFrames: cc.SpriteFrame[] = [];

   @property(cc.SpriteFrame) lockSprFrame: cc.SpriteFrame = null;
   @property(cc.SpriteFrame) coin50SprFrame: cc.SpriteFrame = null;
   @property(cc.SpriteFrame) coinSprFrame: cc.SpriteFrame = null;
   @property(cc.SpriteFrame) tokenSprFrame: cc.SpriteFrame = null;

   public static ins: GardenAssetManager = null;

   protected onLoad(): void {
      GardenAssetManager.ins = this;
   }

   protected onDestroy(): void { GardenAssetManager.ins = null; }
}

export class GardenAssetHelper {
   static getItemSpriteFrame(itemType, index) {
      let asset = GardenAssetManager.ins;
      switch (itemType) {
         case ITEM_TYPE.COIN: return asset.coinSprFrame;
         case ITEM_TYPE.TOKEN: return asset.tokenSprFrame;
         case ITEM_TYPE.SEED: return asset.plantMaturedSprFrames[index];
         case ITEM_TYPE.POT: return asset.potSprFrames[index];
         case ITEM_TYPE.FERTILIZER: return asset.fertilizerSprFrames[index];
      } return null;
   }
}
