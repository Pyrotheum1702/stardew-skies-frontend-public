import { CURRENCY } from "../../Config/Constant";
import { GlobalVar } from "../../Helper/GlobalVar";
import Utils from "../../Helper/Utils";
import { getFloorConfig } from "../../Main/GardenFloorBuilder/GardenFloorBuilder";

const { ccclass, property } = cc._decorator;

@ccclass
export default class UnlockNewFloorPanel extends cc.Component {
   @property(cc.Node) overlayBG: cc.Node = null;
   @property([cc.Node]) actionBtns: cc.Node[] = [];
   @property(cc.Label) descriptionLb: cc.Label = null;
   @property([cc.Label]) requirementLbs: cc.Label[] = [];
   @property([cc.Node]) requirementIcons: cc.Node[] = [];
   @property([cc.Node]) requirementCheckMarks: cc.Node[] = [];
   @property([cc.SpriteFrame]) requirementIconSprFrames: cc.SpriteFrame[] = [];

   floorIndex = 0;
   destroyCallback = null;
   onClickActionCallback = null;
   blockAllAction = false;

   protected onLoad(): void {
      this.overlayBG.opacity = 0;
      cc.tween(this.overlayBG).to(0.25, { opacity: 35 }, { easing: 'sineIn' }).start();
      this.overlayBG.on(cc.Node.EventType.TOUCH_END, this.exit, this);
      cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event) => {
         if (event.keyCode === cc.macro.KEY.escape) this.exit();
      }, this);
   }

   onClickActionBtn(evt, CED) {
      if (this.blockAllAction) return;
      const index = parseInt(CED);

      switch (index) {
         case 0: {
            this.onClickActionCallback?.();
            break;
         } case 1: {
            this.exit();
            break;
         }
      }

      this.blockAllAction = true;
   }

   updateInfo() {
      const config = getFloorConfig(this.floorIndex);
      const { cost, currency, levelRequirement } = config;

      const profile = GlobalVar.profile;
      const levelSatisfied = profile.level >= levelRequirement;

      this.requirementLbs[1].string = `${profile.level} / ${levelRequirement}`;
      this.requirementLbs[1].node.parent.opacity = levelSatisfied ? 255 : 150;
      this.requirementCheckMarks[1].active = levelSatisfied;

      const currencyMap = {
         [CURRENCY.COIN]: {
            color: new cc.Color().fromHEX(`#FFF087`),
            amount: profile.coin,
            iconFrame: this.requirementIconSprFrames[0],
         },
         [CURRENCY.TOKEN]: {
            color: new cc.Color().fromHEX(`#92D8FF`),
            amount: profile.token,
            iconFrame: this.requirementIconSprFrames[1],
         }
      };

      const { amount, iconFrame, color } = currencyMap[currency] || {};
      const affordable = amount >= cost;
      const attainable = affordable && levelSatisfied;

      this.requirementLbs[0].string = `${Utils.formatNumberWithCommas(Math.min(amount, cost))} / ${Utils.formatNumberWithCommas(cost)}`;
      this.requirementLbs[0].node.parent.opacity = attainable ? 255 : 150;
      this.requirementLbs[0].node.color = color;
      this.requirementCheckMarks[0].opacity = attainable ? 255 : 150;
      this.actionBtns[0].opacity = attainable ? 255 : 150;
      this.actionBtns[0].getComponent(cc.Button).interactable = attainable;
      this.requirementCheckMarks[0].active = affordable;

      this.requirementIcons[0].getComponentsInChildren(cc.Sprite).forEach(spr => {
         spr.spriteFrame = iconFrame;
      });
   }

   exit() {
      if (this.blockAllAction) return;
      this.blockAllAction = true;
      Utils.fadeOutNode(this.node, 0.25, null, true);
   }

   protected onDestroy(): void {
      this.destroyCallback?.();
   }
}
