import { Injectable } from '@angular/core'
import { Plugins } from '@capacitor/core'
import { NavController } from '@ionic/angular'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(public navCtrl: NavController) {}

  async getCurrentState(): Promise<boolean> {
    const result = await Plugins.FacebookLogin.getCurrentAccessToken()

    try {
      return result && result.accessToken == null
    } catch (e) {
      return false
    }
  }

  async signIn(): Promise<void> {
    const FACEBOOK_PERMISSIONS = [
      'email',
      'user_birthday',
      'user_gender',
      'user_location',
    ]
    const result = await Plugins.FacebookLogin.login({
      permissions: FACEBOOK_PERMISSIONS,
    })

    if (result && result.accessToken == null) {
      this.navCtrl.navigateRoot(['/'])
    }
  }

  async signOut(): Promise<void> {
    await Plugins.FacebookLogin.logout()
    this.navCtrl.navigateRoot(['/auth'])
  }
}
