import { CONFIG } from "../../Config/Config";
import { GlobalVar } from "../../Helper/GlobalVar";
import Utils from "../../Helper/Utils";
import Shop from "../../Modules/Shop/Shop";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ProfileInfoManager extends cc.Component {
   public static ins: ProfileInfoManager = null;

   @property(cc.Sprite) expBarFill: cc.Sprite = null

   @property(cc.Label) nameLb: cc.Label = null
   @property(cc.Label) walletAddressLb: cc.Label = null

   @property(cc.Label) levelLb: cc.Label = null
   @property(cc.Label) experienceLb: cc.Label = null

   @property(cc.Label) coinLb: cc.Label = null
   @property(cc.Label) tokenLb: cc.Label = null

   @property(cc.Sprite) avatarSpr: cc.Sprite = null

   @property([cc.SpriteFrame]) avatarSprFrames: cc.SpriteFrame[] = []

   protected onLoad(): void {
      ProfileInfoManager.ins = this;
      this.scheduleOnce(this.updateProfileInfo);
   }

   updateProfileInfo() {
      const exp = GlobalVar.profile.exp;
      const coin = GlobalVar.profile.coin;
      const level = GlobalVar.profile.level;
      const token = GlobalVar.profile.token;
      const name = GlobalVar.profile.name;

      this.avatarSpr.spriteFrame = this.avatarSprFrames[GlobalVar.profile.avatarIndex || 0];

      this.nameLb.string = name || `...`;
      this.levelLb.string = `Lv ${level}`;
      this.walletAddressLb.string = `...`;

      let curBalance = this.coinLb.string;
      curBalance = curBalance.replace(',', '');
      Utils.tweenLb(this.coinLb, parseInt(curBalance), coin, 0.5, 'sineIn', '', '', '', Utils.formatNumberWithCommas);

      curBalance = this.tokenLb.string;
      curBalance = curBalance.replace(',', '');
      Utils.tweenLb(this.tokenLb, parseInt(curBalance), token, 0.5, 'sineIn', '', '', '', Utils.formatNumberWithCommas);

      if (Shop.Instance) {
         curBalance = Shop.Instance.coinBalanceLb.string;
         curBalance = curBalance.replace(',', '');
         Utils.tweenLb(Shop.Instance.coinBalanceLb, parseInt(curBalance), coin, 0.5, 'sineIn', '', '', '', Utils.formatNumberWithCommas);

         curBalance = Shop.Instance.tokenBalanceLb.string;
         curBalance = curBalance.replace(',', '');
         Utils.tweenLb(Shop.Instance.tokenBalanceLb, parseInt(curBalance), token, 0.5, 'sineIn', '', '', '', Utils.formatNumberWithCommas);
      }

      // const currentExp = Math.round(Math.max(0, exp));
      const expToLvUp = calculateExperienceRequiredAtLevel(level + 1);

      cc.tween(this.expBarFill).to(0.66, { fillRange: (exp / expToLvUp) }, { easing: "sineIn" }).start();
      this.experienceLb.string = `${exp}/${expToLvUp}`;
   }



   protected onDestroy(): void {
      ProfileInfoManager.ins = null;
   }
}

function calculateExperienceRequiredAtLevel(level) {
   return Math.round(CONFIG.baseExpRequiredToLevelUp * level * (level - 1));
}