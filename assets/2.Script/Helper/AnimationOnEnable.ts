import Utils from "./Utils";

const { ccclass, property } = cc._decorator;
export enum ANIM_TYPE {
   NONE = 0,
   LEFT_TO_RIGHT = 1,
   RIGHT_TO_LEFT = 2,
   DOWN_TO_UP = 3,
   UP_TO_DOWN = 4,
   EXPAND = 5,
   FADE_IN = 6,
   TWIST_IN = 7,
}

const tween = cc.tween
@ccclass
export default class AnimationOnEnable extends cc.Component {
   @property({ type: cc.Enum(ANIM_TYPE) })
   anim_type: ANIM_TYPE = ANIM_TYPE.NONE
   @property onLoadOpacity = 255
   @property delay = 0
   @property amplify = 1
   @property transitionTime = 0.33
   @property executeOnEnable = true

   startScale = 0
   startPos: cc.Vec3 = null
   startAngle = 0
   startOpacity = 0

   protected onLoad(): void {
      this.startScale = this.node.scale
      this.startPos = this.node.position
      this.startAngle = this.node.angle
      this.startOpacity = this.node.opacity
      this.node.opacity = this.onLoadOpacity
   }

   public resetStat() {
      this.startScale = this.node.scale
      this.startPos = this.node.position
      this.startAngle = this.node.angle
      this.startOpacity = this.node.opacity
   }

   sideWayOffset = 150
   verticalOffset = 150
   expandScaleOffset = 0.2
   twistAngleOffset = 360

   protected onEnable(): void {
      if (this.startScale == 0) this.startScale = this.node.scale
      if (this.startPos == null) this.startPos = this.node.position
      if (this.startAngle == 0) this.startAngle = this.node.angle
      if (this.startOpacity == 0) this.startOpacity = this.node.opacity

      if (!this.executeOnEnable) return
      const execute = () => {
         this.node.opacity = 0
         cc.tween(this.node).to(this.transitionTime, { opacity: this.startOpacity }, { easing: 'sineOut' }).start()
         switch (this.anim_type) {
            case ANIM_TYPE.NONE: {
               break
            }
            case ANIM_TYPE.LEFT_TO_RIGHT: {
               this.node.position = cc.v3(this.startPos.x - (this.sideWayOffset * this.amplify), this.startPos.y)
               cc.tween(this.node).to(this.transitionTime, { position: this.startPos }, { easing: 'backOut' }).start()
               break
            }
            case ANIM_TYPE.RIGHT_TO_LEFT: {
               this.node.position = cc.v3(this.startPos.x + (this.sideWayOffset * this.amplify), this.startPos.y)
               cc.tween(this.node).to(this.transitionTime, { position: this.startPos }, { easing: 'backOut' }).start()
               break
            }
            case ANIM_TYPE.DOWN_TO_UP: {
               this.node.position = cc.v3(this.startPos.x, this.startPos.y - (this.verticalOffset * this.amplify))
               cc.tween(this.node).to(this.transitionTime, { position: this.startPos }, { easing: 'backOut' }).start()
               break
            }
            case ANIM_TYPE.UP_TO_DOWN: {
               this.node.position = cc.v3(this.startPos.x, this.startPos.y + (this.verticalOffset * this.amplify))
               cc.tween(this.node).to(this.transitionTime, { position: this.startPos }, { easing: 'backOut' }).start()
               break
            }
            case ANIM_TYPE.EXPAND: {
               this.node.scale = this.startScale - this.expandScaleOffset * this.amplify
               cc.tween(this.node).to(this.transitionTime, { scale: this.startScale }, { easing: 'backOut' }).start()
               break
            }
            case ANIM_TYPE.TWIST_IN: {
               this.node.angle = this.startAngle - this.twistAngleOffset * this.amplify
               cc.tween(this.node).to(this.transitionTime, { angle: this.startAngle }, { easing: 'backOut' }).start()
               break
            }
            case ANIM_TYPE.FADE_IN: {
               // Utils.fadeInNode(this.node, this.transitionTime)
               break
            }
         }
      }

      if (this.delay > 0) { this.scheduleOnce(() => { execute() }, this.delay) }
      else execute()
   }

   public trigger(anim_type: ANIM_TYPE = null) {
      if (this.startScale == 0) this.startScale = this.node.scale
      if (this.startPos == null) this.startPos = this.node.position
      if (this.startAngle == 0) this.startAngle = this.node.angle
      if (this.startOpacity == 0) this.startOpacity = this.node.opacity

      if (anim_type == null) anim_type = this.anim_type

      const execute = () => {
         this.node.opacity = 0
         cc.tween(this.node).to(this.transitionTime, { opacity: this.startOpacity }, { easing: 'sineOut' }).start()
         switch (anim_type) {
            case ANIM_TYPE.NONE: {
               break
            }
            case ANIM_TYPE.LEFT_TO_RIGHT: {
               this.node.position = cc.v3(this.startPos.x - (this.sideWayOffset * this.amplify), this.startPos.y)
               cc.tween(this.node).to(this.transitionTime, { position: this.startPos }, { easing: 'backOut' }).start()
               break
            }
            case ANIM_TYPE.RIGHT_TO_LEFT: {
               this.node.position = cc.v3(this.startPos.x + (this.sideWayOffset * this.amplify), this.startPos.y)
               cc.tween(this.node).to(this.transitionTime, { position: this.startPos }, { easing: 'backOut' }).start()
               break
            }
            case ANIM_TYPE.DOWN_TO_UP: {
               this.node.position = cc.v3(this.startPos.x, this.startPos.y - (this.verticalOffset * this.amplify))
               cc.tween(this.node).to(this.transitionTime, { position: this.startPos }, { easing: 'backOut' }).start()
               break
            }
            case ANIM_TYPE.UP_TO_DOWN: {
               this.node.position = cc.v3(this.startPos.x, this.startPos.y + (this.verticalOffset * this.amplify))
               cc.tween(this.node).to(this.transitionTime, { position: this.startPos }, { easing: 'backOut' }).start()
               break
            }
            case ANIM_TYPE.EXPAND: {
               this.node.scale = this.startScale - this.expandScaleOffset * this.amplify
               cc.tween(this.node).to(this.transitionTime, { scale: this.startScale }, { easing: 'backOut' }).start()
               break
            }
            case ANIM_TYPE.TWIST_IN: {
               this.node.angle = this.startAngle - this.twistAngleOffset * this.amplify
               cc.tween(this.node).to(this.transitionTime, { angle: this.startAngle }, { easing: 'backOut' }).start()
               break
            }
            case ANIM_TYPE.FADE_IN: {
               // Utils.fadeInNode(this.node)
               break
            }
         }
      }

      if (this.delay > 0) {
         this.scheduleOnce(() => { execute() }, this.delay)
      }
      else execute()
   }
}
