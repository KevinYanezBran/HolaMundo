// author: Kevin Omar Yañez Bran
import { Component, inject, NgZone } from '@angular/core';
import { Firestore, collection, query, where, getDocs, DocumentData } from '@angular/fire/firestore';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage {
  private firestore = inject(Firestore);
  private auth = inject(Auth);
  private ngZone = inject(NgZone);

  user: any = null;

  constructor() {
    this.loadUserProfile();
  }

  async loadUserProfile() {
    onAuthStateChanged(this.auth, async (user) => {
      if (user) {
        try {
          const usersCollection = collection(this.firestore, 'users');
          const q = query(usersCollection, where('id', '==', user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            this.ngZone.run(() => {
              let userData: DocumentData = querySnapshot.docs[0].data();

              if (userData['last_login'] && userData['last_login']['seconds']) {
                const date = new Date(userData['last_login']['seconds'] * 1000);
                userData['last_login'] = date.toLocaleString('es-MX', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                });
              }

              this.user = userData;
              console.log("Perfil cargado:", this.user);
            });
          } else {
            console.warn("Usuario no encontrado en Firestore.");
          }
        } catch (error) {
          console.error("Error al obtener perfil:", error);
        }
      }
    });
  }
}
