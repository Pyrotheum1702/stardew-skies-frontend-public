const { ccclass, property } = cc._decorator;

@ccclass
export default class SoundPlayer extends cc.Component {
   @property(Array(cc.AudioClip))
   audioClips: Array<cc.AudioClip> = new Array<cc.AudioClip>();
   @property(Array(cc.AudioClip))
   musics: Array<cc.AudioClip> = new Array<cc.AudioClip>();

   playingSound = {}
   public static ins: SoundPlayer = null;
   onLoad() {
      if (SoundPlayer.ins) {
         this.node.destroy()
         return
      }
      SoundPlayer.ins = this;
      cc.game.addPersistRootNode(this.node)
   }

   play(soundName: string) {
      if (true)
         // if (LocalStorage.getAudio())
         this.audioClips.forEach(clip => {
            if (clip != null && clip.name == soundName) {
               cc.audioEngine.playEffect(clip, false)
            }
         });
   }

   startSound(soundName: string) {
      if (this.playingSound[soundName]) return
      cc.tween()
      if (true)
         // if (LocalStorage.getAudio())
         this.audioClips.forEach(clip => {
            if (clip != null && clip.name == soundName) {
               let id = cc.audioEngine.playEffect(clip, true)

               this.playingSound[soundName] = id

               let t = new cc.Node()
               t.setParent(cc.director.getScene())
               cc.tween(t).to(0.2, { angle: 1 }, {
                  onUpdate: () => {
                     cc.audioEngine.setEffectsVolume(t.angle)
                  }, easing: 'sineIn'
               }).start()
            }
         });
   }

   stopSound(soundName: string) {
      let soundId = this.playingSound[soundName]
      if (!soundId) return

      this.playingSound[soundName] = null

      let t = new cc.Node()
      t.angle = 1
      t.setParent(cc.director.getScene())
      cc.tween(t).to(0.5, { angle: 0 }, {
         onUpdate: () => {
            cc.audioEngine.setEffectsVolume(t.angle)
         }, easing: 'sineIn'
      }).call(() => {
         cc.audioEngine.setEffectsVolume(1)
         cc.audioEngine.stopEffect(soundId)
      }).start()
   }

   playButton() {
      this.play("Button Sound")
   }

   playMusic(musicName: string) {
      this.musics.forEach(music => {
         if (music != null && music.name == musicName) {
            cc.audioEngine.playMusic(music, true);
            // cc.audioEngine.setMusicVolume(LocalStorage.getMusic() ? 0.5 : 0)
         }
      });
   }

   updateMusicVolume(vol) {
      cc.audioEngine.setMusicVolume(vol)
   }

   stopMusic() {
      let t = new cc.Node()
      t.angle = 0.5
      t.setParent(cc.director.getScene())

      cc.tween(t).to(1, { angle: 0 }, {
         onUpdate: () => {
            cc.audioEngine.setMusicVolume(t.angle)
         }, easing: 'sineIn'
      }).call(() => {
         cc.audioEngine.stopMusic();
      }).start()
   }

   // newAudioSourcePlay(soundName: string) {
   //     if (JSON.parse(Utils.getLocal(GlobalVariables.GAME_NAME + 'sound')))
   //         this.audioClips.forEach(clip => {
   //             if (clip.name == soundName) {
   //                 const newAudioSource = this.addComponent(cc.AudioSource);
   //                 newAudioSource.clip = clip;
   //                 newAudioSource.play();
   //             }
   //         });
   // }
}
