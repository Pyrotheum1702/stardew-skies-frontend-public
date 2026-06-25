/**
 * Environment / deployment configuration.
 *
 * Single source of truth for anything that changes between local development
 * and the deployed game: API endpoints, request limits, and the environment
 * detection used to pick between them.
 */
const API_BASE = {
   local: "http://localhost:10000/stardew-skies-test",
   production: "https://pyrotheum1702.com/stardew-skies",
};

export const ENV = {
   /** True when the build is served from the public game path (production). */
   get isProduction(): boolean {
      return location.pathname.includes("game");
   },

   /** True for local development (inverse of {@link ENV.isProduction}). */
   get isLocal(): boolean {
      return !ENV.isProduction;
   },

   API: {
      timeoutMs: 15000,

      /** Backend base URL for the current environment (no trailing path). */
      get base(): string {
         return ENV.isProduction ? API_BASE.production : API_BASE.local;
      },

      /** The single operation-routed request endpoint. */
      get url(): string {
         return `${ENV.API.base}/api/request`;
      },

      /** Twitter/web OAuth entry point (browser redirect). */
      get twitterLoginUrl(): string {
         return `${ENV.API.base}/api/login/twitter`;
      },
   },
};

export const CONFIG = {
   ver: `1.0.0`,

   RESPONSE_STATUS: {
      NOT_OK: 0,
      OK: 1
   },

   PLANT_OFFSET_Y: 50,
   WATERING_CAN_OFFSET_V: cc.v2(-108, 255),
   WATERING_CAN_OFFSET_ANGLE: -27,
   WATERING_CAN_ANIM_ANGLE_TILT: -53,

   FERTILIZER_BAG_OFFSET_V: cc.v2(-108, 255),
   FERTILIZER_BAG_OFFSET_ANGLE: -30,
   FERTILIZER_BAG_ANIM_ANGLE_TILT: -25,

   ALERT_OFFSET_V: cc.v2(60, 254),
   ALERT_OFFSET_LOW_V: cc.v2(60, 174),

   baseExpRequiredToLevelUp: 200,
}

export const REQUEST_OPERATION = {
   LOGIN: 1010,
   LOGIN_TELEGRAM: 1020,

   GET_SHOP: 2010,
   MAKE_SHOP_PURCHASE: 2020,

   GET_GARDEN: 3010,
   SPECTATE_GARDEN: 3011,
   PLACE_POT: 3015,
   PLANT_SEED: 3020,
   WATER_PLANT: 3021,
   ADD_FERTILIZER: 3023,
   CATCH_BUG: 3025,
   HARVEST_PLANT: 3030,

   ADD_FLOOR: 3510,

   GET_REFERRAL_PROFILE: 4010,

   GET_TASK: 5010,
   DO_TASK: 5020,

   GET_LEADERBOARD: 6010,

   SUBMIT_GIFT_CODE: 7010,

   GET_LUCKY_SPIN_WHEEL: 8010,
   SPIN_LUCKY_WHEEL: 8020,
}