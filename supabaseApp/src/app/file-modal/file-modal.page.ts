import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController, LoadingController } from '@ionic/angular';
import { SupabaseService } from '../services/supabase.service';
 
@Component({
  selector: 'app-file-modal',
  templateUrl: './file-modal.page.html',
  styleUrls: ['./file-modal.page.scss'],
})
export class FileModalPage implements OnInit {
  @Input() image: any;
  info = {
    private: false,
    title: 'That looks good'
  };
 
  imagePath = null;
 
  constructor(private modalCtrl: ModalController, private supabaseService: SupabaseService, private loadingCtrl: LoadingController,
    private sanitizer: DomSanitizer) { }
 
  ngOnInit() {
    this.imagePath = this.sanitizer.bypassSecurityTrustResourceUrl(this.image.webPath);
  }
 
  async save() {
    const loading = await this.loadingCtrl.create({
      message: 'Uploading File...'
    });
    await loading.present();
 
    await this.supabaseService.uploadFile(this.image, this.info);
    await loading.dismiss();
    this.modalCtrl.dismiss();
  }
 
  close() {
    this.modalCtrl.dismiss();
  }
}