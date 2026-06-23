import { GlobalVar } from "./GlobalVar";
// import * as XMLParser from 'fast-xml-parser';

const { ccclass, property } = cc._decorator;
//@ts-ignore
const zlib = require('zlib');

export default class Utils extends cc.Component {
   public static BACKGROUND_WHITE_COLOR: string = 'ebfaff';

   public static worldSpaceToLocal(worldSpace: cc.Vec2, local: cc.Node) {
      return local.convertToNodeSpaceAR(worldSpace)
   }
   public static getWorldPos(node: cc.Node): cc.Vec2 {
      return node.convertToWorldSpaceAR(cc.Vec2.ZERO_R)
   }

   public static getRandomRainbowColor(): cc.Color {
      var primaryColor = this.random(0, 2)
      var secondaryColor = this.random(0, 2)
      var colorAsArray = [0, 0, 0]
      colorAsArray[secondaryColor] = this.random(0, 255)
      colorAsArray[primaryColor] = 255

      return cc.color(colorAsArray[0], colorAsArray[1], colorAsArray[2])
   }

   public static getOneOrMinusOne() {
      return (this.random(0, 1) == 1) ? 1 : -1;
   }
   public static random(minInclusive: number, maxInclusive: number): number {
      const range = maxInclusive - minInclusive + 1;
      const randomValue = Math.floor(Math.random() * range) + minInclusive;
      return randomValue;
   }
   public static randomDecimal(minInclusive: number, maxInclusive: number): number {
      return Math.random() * (maxInclusive - minInclusive) + minInclusive;
   }

   public static getRandomBool100BaseChance(chance: number) {
      return this.random(0, 100) <= chance
   }

   public static getRandomItemInArray(arr: Array<any>) {
      return arr[this.random(0, arr.length - 1)]
   }

   public static booleanRandom(trueChance: number = 1, totalChance: number = 1): boolean {
      if (this.random(0, totalChance) <= trueChance) return true
      else return false
   }

   public static getLocal(itemName: string): any {
      return cc.sys.localStorage.getItem(itemName);
   }

   public static setLocal(itemName: string, value: any): void {
      return cc.sys.localStorage.setItem(itemName, value);
   }

   public static angleToVector2Normal(angle: number): cc.Vec2 {
      const x = Math.cos(angle * Math.PI / 180);
      const y = Math.sin(angle * Math.PI / 180);
      return cc.v2(x, y);
   }

   public static vector2NormalToAngle(vector2Normal: cc.Vec2): number {
      return cc.misc.radiansToDegrees(Math.atan2(vector2Normal.y, vector2Normal.x));
   }

   public static getMidPointOf2Vec2(vecA: cc.Vec2, vecB: cc.Vec2) {
      return cc.v2((vecA.x + vecB.x) / 2, (vecA.y + vecB.y) / 2)
   }
   public static initPhysic() {
      let physicManager = cc.director.getPhysicsManager();
      physicManager.enabled = true;
   }

   public static syncFixedTimeStep() {
      let physicManager = cc.director.getPhysicsManager();
      physicManager.enabledAccumulator = true;

      cc.PhysicsManager.FIXED_TIME_STEP = 1 / cc.game.getFrameRate();
      // cc.PhysicsManager.POSITION_ITERATIONS = cc.game.getFrameRate();
      // cc.PhysicsManager.MAX_ACCUMULATOR = 8;
   }

   public static slowMotionMode() {
      let physicManager = cc.director.getPhysicsManager();
      physicManager.enabledAccumulator = true;
      cc.PhysicsManager.FIXED_TIME_STEP = 1 / cc.game.getFrameRate() * 100;
   }

   public static shuffle(array) {
      let currentIndex = array.length, randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex > 0) {
         // Pick a remaining element.
         randomIndex = Math.floor(Math.random() * currentIndex);
         currentIndex--;

         // And swap it with the current element.
         [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
      }

      return array;
   }

   public static threeDigitBased(number: number): string {
      if (number < 10) {
         return '00' + number
      } else if (number < 100) {
         return '0' + number
      } else return number.toString()
   }

   public static twoDigitBased(number: number): string {
      if (number < 10) return '0' + number
      else return number.toString()
   }
   public static randomPositionInsideCircle(centralPoint: cc.Vec2, radius: number): cc.Vec2 {// Generate random angles for x and y coordinates
      var randomAngle = Math.random() * 2 * Math.PI;

      // Calculate random position inside the circle
      var randomX = centralPoint.x + Math.cos(randomAngle) * (Math.random() * radius);
      var randomY = centralPoint.y + Math.sin(randomAngle) * (Math.random() * radius);

      // Return the random position as a cc.Vector2 object
      return new cc.Vec2(randomX, randomY);
   }
   public static randomString(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      let counter = 0;
      while (counter < length) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength));
         counter += 1;
      }
      return result;
   }

   public static zip(data, callback) {
      zlib.gzip(JSON.stringify(data), (error, datazip) => {
         if (error) {
            console.log('error: ', error);
         } else {
            callback(datazip.toString('base64'));
         }
      });
   }
   public static unzip(data, callback) {
      //@ts-ignore
      const buffer = Buffer.from(data, 'base64');
      zlib.gunzip(buffer, (error, dataUnzip) => {
         if (error) {
            console.log('error: ', error, dataUnzip);
         } else {
            callback(JSON.parse(dataUnzip));
         }
      });
   }
   public static removeElementFromArray(element, arr) {
      const index = arr.indexOf(element);
      if (index !== -1) {
         arr.splice(index, 1);
      }
   }
   public static convertPosToClientCoordinate(pos: cc.Vec3): cc.Vec2 {
      return cc.v2(pos.x - 2500, 2500 - pos.y)
   }
   public static convertPosToServerCoordinate(pos: cc.Vec3): cc.Vec2 {
      return cc.v2(pos.x + 2500, 2500 - pos.y)
   }
   public static tweenLb(label: cc.Label, startNumber: number, endNumber: number, duration: number = 1, easing = 'sineIn', onCompleteCallback?, appendFront = '', pushFront = '', formatFunc?, onValueChange?) {
      let dummyTween = new cc.Node()
      dummyTween.parent = cc.director.getScene()
      dummyTween.angle = startNumber
      let lbTween = cc.tween(dummyTween).to(duration, { angle: endNumber }, {
         easing: 'sineIn', onUpdate: () => {
            let string = appendFront + (Math.round(dummyTween.angle)).toString() + pushFront
            if (formatFunc) string = formatFunc(string)
            if (label) label.string = string
            if (onValueChange) onValueChange()
         }
      }).call(() => {
         let string = '' + endNumber
         if (formatFunc) string = formatFunc(string)
         label.string = string
         dummyTween.destroy()
         if (onCompleteCallback) onCompleteCallback()
      }).start()

      return lbTween
   }
   public static collapseNode(node: cc.Node, callBack = null, duration: number = 0.25, destroyOnCollapsed = false) {
      if (!node) return
      let target = node
      let startScale = target.scale
      cc.tween(target).to(duration, { scale: 0, opacity: 0 }, { easing: 'backIn' }).call(() => { if (callBack) callBack() }).call(() => { node.active = false; node.scale = startScale }).call(() => { if (destroyOnCollapsed) target.destroy() }).start()
   }
   public static popupNode(node: cc.Node, duration: number = 0.25, callBack = null, up = true) {
      node.active = true
      let startScale = node.scale
      let startPos = cc.v3(node.position.x, node.position.y, 1)
      node.opacity = 0
      let blockInput = new cc.Node()
      blockInput.setContentSize(10000, 10000)
      blockInput.addComponent(cc.BlockInputEvents)
      blockInput.parent = node
      blockInput.setSiblingIndex(cc.macro.MAX_ZINDEX)

      node.scale = 0
      node.position = cc.v3(node.position.x, node.position.y - ((up) ? 50 : 0))
      cc.tween(node).to(duration, { scale: startScale, position: startPos, opacity: 255 }, { easing: 'backOut' }).call(() => { if (callBack) callBack(); blockInput.destroy() }).start()
   }

   public static parseToTime(time: number): string {
      let min = '' + Math.floor(time / 10)
      let second = '' + Math.floor((time % 60) / 10) + time % 10
      let s = '' + Math.floor(time / 60) + ":" + second
      return s
   }

   public static wrap(value: number, min: number, max: number): number {
      const range = max - min;
      return ((value - min) % range + range) % range + min;
   }

   public static loadImgFromUrl(_sprite: cc.Sprite = null, url: string = '', callback = null, onErr = null) {
      try {
         if (_sprite === undefined || _sprite === null || url === '') {
            if (onErr) onErr()
            return;
         }
         cc.assetManager.loadRemote<cc.Texture2D>(url, { ext: '.png' }, (err, tex: cc.Texture2D) => {
            if (err != null) {
               if (onErr) onErr()
               return;
            }
            if (_sprite === undefined || _sprite === null) {
               if (onErr) onErr()
               return;
            }
            try {
               _sprite.spriteFrame = new cc.SpriteFrame(tex);
               if (callback !== null) {
                  callback()
               }
            } catch (e) {
               if (onErr) onErr()
            }
         });
      } catch (e) { console.log(e); }
   }

   static findClosestPoint(referencePoint: cc.Vec2, points: cc.Vec2[]): cc.Vec2 | null {
      if (points.length === 0) return null;

      let closestPoint: cc.Vec2 | null = null;
      let minDistance = Infinity;

      for (const point of points) {
         const dist = cc.Vec2.distance(point, referencePoint)
         if (dist < minDistance) {
            minDistance = dist;
            closestPoint = point;
         }
      }

      return closestPoint;
   }

   public static truncateString(str, limit = 20) {
      if (str.length > limit) {
         return str.slice(0, limit - 2) + "..";
      }
      return str;
   }

   public static interpolateColor(hex1: string, hex2: string, t: number) {
      // Ensure t is in range [0, 1]
      t = Math.max(0, Math.min(1, t));

      // Remove the '#' if present
      hex1 = hex1.replace('#', '');
      hex2 = hex2.replace('#', '');

      // Parse RGB values from hex1 and hex2
      const r1 = parseInt(hex1.substring(0, 2), 16);
      const g1 = parseInt(hex1.substring(2, 4), 16);
      const b1 = parseInt(hex1.substring(4, 6), 16);

      const r2 = parseInt(hex2.substring(0, 2), 16);
      const g2 = parseInt(hex2.substring(2, 4), 16);
      const b2 = parseInt(hex2.substring(4, 6), 16);

      // Interpolate each channel
      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);

      // Convert back to hex
      const toHex = (value) => value.toString(16).padStart(2, '0');
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
   }

   public static clampToFourDecimals(decimalStr: string): string {
      const parts = decimalStr.split('.');
      if (parts.length === 2) {
         const whole = parts[0];
         let fraction = parts[1].substring(0, 4);
         return `${whole}.${fraction}`;
      }
      return decimalStr;
   }

   public static clampToTwoDecimals(decimalStr: string): string {
      const parts = decimalStr.split('.');
      if (parts.length === 2) {
         const whole = parts[0];
         let fraction = parts[1].substring(0, 2);
         return `${whole}.${fraction}`;
      }
      return decimalStr;
   }

   public static calculateMiddlePoint(points: cc.Vec2[]): cc.Vec2 {
      const length = points.length;
      let totalX = 0;
      let totalY = 0;

      for (const point of points) {
         totalX += point.x;
         totalY += point.y;
      }
      return cc.v2(totalX / length, totalY / length);
   }

   public static parseToBalanceString(value, removeUnnecessaryDigit = false): string {
      if (value < 0) return '???'
      if (value < 1e3) return value.toString()
      let s = ''

      if (value == Infinity) return '∞'

      if (value >= 1e3 && value < 1e6) {
         if (value == 1e3) return '1K'
         s = Math.floor(value / 1e3) + ((!removeUnnecessaryDigit) ? (',' + Math.floor(value % 1e3 / 1e2) + Math.floor(value % 1e2 / 1e1)) : '') + 'K'
      } else if (value >= 1e6 && value < 1e9) {
         if (value == 1e6) return '1M'
         s = Math.floor(value / 1e6) + ((!removeUnnecessaryDigit) ? (',' + Math.floor(value % 1e6 / 1e5) + Math.floor(value % 1e5 / 1e4)) : '') + 'M'
      } else if (value >= 1e9 && value < 1e12) {
         if (value == 1e9) return '1B'
         s = Math.floor(value / 1e9) + ((!removeUnnecessaryDigit) ? (',' + Math.floor(value % 1e9 / 1e8) + Math.floor(value % 1e8 / 1e7)) : '') + 'B'
      } else if (value >= 1e12 && value < 1e15) {
         if (value == 1e12) return '1T'
         s = Math.floor(value / 1e12) + ((!removeUnnecessaryDigit) ? (',' + Math.floor(value % 1e12 / 1e11) + Math.floor(value % 1e11 / 1e10)) : '') + 'T'
      }
      for (let i = 0; i < 3; i++) {
         if (s[s.length - 2] == '0' || s[s.length - 2] == ',') s = s.slice(0, s.length - 2) + s[s.length - 1]
      }
      return s
   }

   public static isNumberChar(char: string): boolean {
      const regex = /^\d+$/;
      return regex.test(char);
   }

   public static formatNumberWithCommas(number) {
      if (!number) return "0"
      let numberString = number.toString();
      let formattedString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return formattedString;
   }

   public static formatNumberWithDots(number) {
      if (!number) return "0"
      let numberString = number.toString();
      let formattedString = numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return formattedString;
   }

   public static async sendRequest(param = null, onComplete = null, onError = null) {
      let method = "POST";
      let url = 'http://localhost:10000/stardew-skies-test/api/request';
      let canceled = false;

      if (location.pathname.includes("game")) { url = 'https://piratekings.fun/api/request' }

      try {
         let xhr = new XMLHttpRequest();
         xhr.addEventListener("readystatechange", () => {
            if (canceled) return;
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 400)) {
               let data: any = {};
               data.status = xhr.status;
               if (xhr.responseText != null && xhr.responseText != '')
                  try { data = JSON.parse(xhr.responseText) } catch (e) { console.log("Err :", e) }
               if (onComplete)
                  onComplete(data)
            } else if (xhr.readyState === 4) {
               const data = JSON.parse(xhr.responseText)
               data.status = xhr.status;
               if (onError) onError(data)
            }
         });

         xhr.open(method, url, true);
         xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
         xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
         xhr.timeout = 15000;

         if (param != null) {
            if (GlobalVar.profile?.uuid) param.uuid = GlobalVar.profile.uuid;
            if (GlobalVar.accessToken) param.accessToken = GlobalVar.accessToken;
            xhr.send(JSON.stringify(param));
         } else { throw new Error(`request parameter is empty.`); }

         xhr.onerror = (error) => {
            canceled = true;
            console.log("request error:", error);
            if (onError) onError({ message: `Can not connect to the server!` });
         }
         xhr.ontimeout = () => {
            canceled = true;
            console.log("request timeout.");
            if (onError) onError({ message: `Timeout!` });
         }
      } catch (e) {
         canceled = true;
         console.log("send request error:", e);
         if (onError) onError({ message: e.toString() });
      }
   }

   public static shake(node: cc.Node, iter, intervalTime, originalPos, minDis = 5, maxDis = 10, onComplete = null) {
      if (iter > 0) {
         let randAngle = Math.random() * 360 - 180
         let dir = Utils.angleToVector2Normal(randAngle)

         let newPos = cc.v2(originalPos).add(dir.multiplyScalar(Math.random() * minDis + (maxDis - minDis)))
         cc.tween(node).to(intervalTime, { position: cc.v3(newPos) }).call(() => {
            this.shake(node, iter - 1, intervalTime, originalPos, minDis, maxDis, onComplete)
         }).start()
      } else {
         cc.tween(node).to(intervalTime, { position: originalPos }).call(() => { if (onComplete) onComplete() }).start()
      }
   }

   public static labelToSpriteFrame(lb: cc.Label) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const label = lb
      ctx.font = `${label.fontSize}px ${label.fontFamily}`;
      canvas.width = label.node.width;
      canvas.height = label.node.height

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = label.node.color.toCSS();

      ctx.fillText(label.string, 0, label.node.height);

      const dataUrl = canvas.toDataURL();

      const texture = new cc.Texture2D();
      texture.initWithElement(canvas);
      const spriteFrame = new cc.SpriteFrame();
      spriteFrame.setTexture(texture);

      return spriteFrame;
   }

   public static logRandom(min: number, max: number): number {
      const range = max - min + 1;
      const randomNumber = Math.random();
      const transformedRandom = Math.log(randomNumber + 1) / Math.log(2); // Adjust the function for lower distribution

      return Math.floor(min + transformedRandom * range);
   }

   public static rotateVector2ByDegree(v, dreg) {
      let rad = cc.misc.degreesToRadians(dreg)
      return cc.v2(
         v.x * Math.cos(rad) - v.y * Math.sin(rad),
         v.x * Math.sin(rad) + v.y * Math.cos(rad))
   }
   public static parseRarityNameToIndex(name) {
      if (name == 'Common') return 0
      else if (name == 'Unique') return 1
      else if (name == 'Rare') return 2
      else if (name == 'Epic') return 3
      else if (name == 'Mythical') return 4
      else if (name == 'Legendary') return 5
      else return 0
   }
   public static captureNodeAsSpriteFrame(targetNode: cc.Node): cc.SpriteFrame {
      let renderTexture: cc.RenderTexture = new cc.RenderTexture();
      renderTexture.initWithSize(cc.visibleRect.width, cc.visibleRect.height);
      let cameraNode: cc.Node = new cc.Node();
      let camera: cc.Camera = cameraNode.addComponent(cc.Camera);
      camera.targetTexture = renderTexture;
      camera.render();
      let spriteFrame: cc.SpriteFrame = new cc.SpriteFrame(renderTexture);
      return spriteFrame;
   }
   public static findClosestPos(pos: cc.Vec2, positions): cc.Vec2 {
      let minDistSq = Number.MAX_VALUE;
      let closestPos: cc.Vec2;

      for (const p of positions) {
         const distSq = cc.v2(pos).sub(p.position).magSqr();
         if (distSq < minDistSq) {
            minDistSq = distSq;
            closestPos = p.position;
         }
      }

      return closestPos;
   }

   public static lerpUnclamped(start: cc.Vec2, end: cc.Vec2, t: number): cc.Vec2 {
      return cc.v2(
         start.x + (end.x - start.x) * t,
         start.y + (end.y - start.y) * t
      );
   }

   public static addBalanceSpacing(numberString) {
      numberString = numberString.toString();
      return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
   }

   public static removeSpacing(numberString) { return numberString.replace(/\s+/g, ''); }
   public static removeComma(numberString) { return numberString.replace(/,/g, ''); }

   public static calculateItemProfitAtLevel(level: number, baseProfit: number, profitGrowthRatePerLevel: number) {
      let result = Math.round((baseProfit * level) * profitGrowthRatePerLevel ** (level - 1))
      console.log('level:' + level, baseProfit * level, profitGrowthRatePerLevel ** (level - 1));

      if (level == 0) result = 0
      return result
   }
   public static calculateItemCostAtLevel(level: number, baseCost: number, costGrowthRatePerLevel: number, costGrowthRateIncreasePerLevel: number) {
      let result = Math.round(
         baseCost * Math.pow(costGrowthRatePerLevel, level)
         * Math.pow(costGrowthRateIncreasePerLevel, (level - 1) * (level) / 2))
      if (level == 0) result = baseCost
      // console.log(
      //    'level:' + level,
      //    'baseCost:' + baseCost,
      //    'costGrowthRatePerLevel:' + costGrowthRatePerLevel,
      //    'costGrowthRateIncreasePerLevel:' + costGrowthRateIncreasePerLevel,
      //    'result:' + result);
      return result
   }

   public static parseTimeToReadableString(milliseconds) {
      if (milliseconds == 0) return `0s`;

      const seconds = Math.floor(milliseconds / 1000);
      const days = Math.floor(seconds / 86400);
      const hours = Math.floor((seconds % 86400) / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;

      let result = "";
      if (days > 0) result += `${days} day${days > 1 ? 's' : ''}d `;
      if (days > 0 || hours > 0) result += `${hours.toString().padStart(2, '0')}h `;
      if (days > 0 || hours > 0 || minutes > 0) result += `${minutes.toString().padStart(2, '0')}m `;
      if (hours < 1) result += `${remainingSeconds.toString().padStart(2, '0')}s`;

      return result.trim();
   }

   public static parseTimeToReadableString2(milliseconds: number): string {
      if (milliseconds === 0) return `0s`;

      const totalSeconds = Math.round(milliseconds / 1000);
      if (totalSeconds === 60) return `1m`;
      if (totalSeconds === 3600) return `1h`;

      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Quick return for short durations (like just 8 seconds)
      if (totalSeconds < 10) return `${seconds}s`;

      let parts: string[] = [];

      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (hours < 1 && minutes < 1 && seconds > 0) {
         // Only show seconds if under 1 minute
         parts.push(`${seconds}s`);
      }

      return parts.join(' ');
   }

   public static scaleRect(rect: cc.Rect, scale) {
      let newRect = new cc.Rect();
      const w = rect.width;
      const h = rect.height;

      newRect.x = rect.x + (w - w * scale) / 2;
      newRect.y = rect.y + (h - h * scale) / 2;
      newRect.width = rect.width * scale;
      newRect.height = rect.height * scale;

      return newRect;
   }

   public static parseMilliseconds(milliseconds) {
      // Calculate the time components
      const totalSeconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      // Construct the time string
      let timeString = '';

      if (hours > 0) {
         timeString += `${String(hours).padStart(2, '0')}h `;
      }

      if (minutes > 0 || hours > 0) {
         timeString += `${String(minutes).padStart(2, '0')}m `;
      }

      if (hours === 0 && minutes === 0) {
         timeString += `${String(seconds).padStart(2, '0')}s`;
      }

      // Trim any trailing space
      return timeString.trim();
   }

   public static fadeOutNode(node: cc.Node, duration: number = 0.25, callBack = null, destroyOnCollapsed = false) {
      if (!node) return
      let target = node
      cc.tween(target).to(duration, { opacity: 0 }, { easing: 'sineIn' }).call(() => { if (callBack) callBack() }).call(() => { node.active = false; }).call(() => { if (destroyOnCollapsed) target.destroy() }).start()
   }

   public static mushroomBounceNode(node: cc.Node, duration: number = 0.25, callBack = null, amp = 0.1) {
      cc.Tween.stopAllByTarget(node);
      const startScale = node.scale;
      node.scale = startScale - (startScale * amp);
      cc.tween(node).to(duration, { scale: startScale }, { easing: 'backOut' }).start();
   }

   public static fadeInNode(node: cc.Node, duration: number = 0.25, callBack = null, up = true) {
      node.active = true
      node.opacity = 0
      let blockInput = new cc.Node()
      blockInput.setContentSize(10000, 10000)
      blockInput.addComponent(cc.BlockInputEvents)
      blockInput.parent = node
      blockInput.setSiblingIndex(cc.macro.MAX_ZINDEX)

      cc.tween(node).to(duration, { opacity: 255 }, { easing: 'sineOut' }).call(() => { if (callBack) callBack(); blockInput.destroy() }).start()
   }

   public static copyToClipboard(
      text: string,
      onSuccess: () => void = null,
      onFailure: (error: string) => void = null
   ) {
      if (cc.sys.isBrowser) {
         // For web browsers
         const textArea = document.createElement("textarea");
         textArea.value = text;
         textArea.style.position = "fixed"; // Avoid scrolling to bottom
         document.body.appendChild(textArea);
         textArea.focus();
         textArea.select();

         try {
            if (document.execCommand('copy')) {
               console.log('Text copied to clipboard');
               onSuccess();
            } else {
               throw new Error('Copy command failed');
            }
         } catch (err) {
            console.error('Unable to copy to clipboard', err);
            onFailure(err.message || 'Failed to copy text to clipboard');
         }

         document.body.removeChild(textArea);
      } else if (cc.sys.isNative) {
         // For native platforms
         try {
            if (cc.sys.os === cc.sys.OS_ANDROID) {
               jsb.reflection.callStaticMethod(
                  "org/cocos2dx/javascript/AppActivity",
                  "copyToClipboard",
                  "(Ljava/lang/String;)V",
                  text
               );
               onSuccess();
            } else if (cc.sys.os === cc.sys.OS_IOS) {
               jsb.reflection.callStaticMethod(
                  "AppController",
                  "copyToClipboard:",
                  text
               );
               onSuccess();
            } else {
               throw new Error('Unsupported native platform');
            }
         } catch (err) {
            console.error('Failed to copy to clipboard on native platform', err);
            onFailure(err.message || 'Failed to copy text to clipboard on native platform');
         }
      } else {
         console.warn('Clipboard copy not supported on this platform');
         onFailure('Clipboard copy not supported on this platform');
      }
   }

   public static isRunningInRealTelegram() {
      //@ts-ignore
      const tg = window?.Telegram?.WebApp;
      return tg && typeof tg.initData === 'string' && tg.initData.length > 0;
   }
}
