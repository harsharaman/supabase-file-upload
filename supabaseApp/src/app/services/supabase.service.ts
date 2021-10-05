import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CameraPhoto, FileSystemDirectory, Plugins } from '@capacitor/core'
import { isPlatform } from '@ionic/core';
import { DomSanitizer } from '@angular/platform-browser';
const { FileSystem } = Plugins;

export const FILE_DB = 'files';

export interface FileInfo {
  private: boolean;
  title: string;
  file_name?: string;
}

export interface FileItem {
  created_at: string;
  file_name: string;
  id: string;
  image_url?: Promise<any>;
  private: boolean;
  title: string;
  user_id: string;
  creator?: boolean;
}

@Injectable({
  providedIn: 'root'
})

//To interface with Supabase
export class SupabaseService {
  private privateFiles: BehaviorSubject<FileItem[]> = new BehaviorSubject([]);
  private publicFiles: BehaviorSubject<FileItem[]> = new BehaviorSubject([]);
  private currentUser: BehaviorSubject<boolean | User> = new BehaviorSubject(null);

  private supabase: SupabaseClient;

  constructor(private router: Router, private sanitizer: DomSanitizer) {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey, {
      autoRefreshToken: true,
      persistSession: true
    });

    //Load user from storage
    this.loadUser();

    //Also listen to all auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('AUTH CHANGED: ', event);

      if (event == 'SIGNED_IN'){
        this.currentUser.next(session.user);
        this.loadFiles();
        this.handleDbChanged(); //For real-time database integration. More TODO later.
      } else {
        this.currentUser.next(false); //Just made me feel better
      }
    });
   }

   async loadUser() {
     const user = await this.supabase.auth.user();

     if (user) {
       this.currentUser.next(user);
       this.loadFiles();
       this.handleDbChanged();
     } else {
       this.currentUser.next(false);
     }
   }

   //helper function so that user from other profiles can't change another user's access
   getCurrentUser() {
     return this.currentUser.asObservable();
   }

   async signUp(credentials: { email, password }) {
     return new Promise(async (resolve, reject) => {
       const { error, data } = await this.supabase.auth.signUp(credentials)
       if (error) {
         reject(error);
       } else {
         resolve(data);
       }
     });
   }

   signIn(credentials: { email, password }) {
     return new Promise(async (resolve, reject) => {
       const { error, data } = await this.supabase.auth.signIn(credentials)
       if (error) {
         reject(error);
       } else {
         resolve(data);
       }
     });
   }

   signOut() {
     this.supabase.auth.signOut().then(_ => {
       this.publicFiles.next([]);
       this.privateFiles.next([]);

       //Clear up and end all active subscriptions
       this.supabase.getSubscriptions().map( sub => {
         this.supabase.removeSubscription(sub);
       });

       this.router.navigateByUrl('/');
     });
   }

   loadFiles() {
     //TODO: Later
   }

   handleDbChanged(){
     //TODO: Later
   }

   async uploadFile(cameraFile: cameraPhoto, info: FileInfo): Promise<any> {
     let file = null;

     //Retreive a file from the URI based on web/mobile
     if (isPlatform('hybrid')) {
       const { data } = await FileSystem.readFile({
         path: cameraFile.path,
         directory: FileSystemDirectory.Documents,
       });
       file = await this.dataUrlToFile(data);
     } else {
       const blob = await fetch(cameraFile.webPath).then(r => r.blob());
       file = new File([blob], 'myFile', {
         type: blob.type,
       });
     }

     const time = new Date().getTime();
     const date = new Date().getDate();
     const accuracy = null;
     const modelID = null;
     const bucketName = info.private ? 'private' : 'public';
     const fileName = `${accuracy}_NC1_${date}${time}:${modelID}.sav`;


     //Upload the file to Supabase
     const { data, error } = await this.supabase
     .storage
     .from(bucketName)
     .upload(fileName, file);

     info.file_name = fileName;

     //Create a record in our DB
     return this.saveFileInfo(info);
   }

   //Create a record in our DB
   async saveFileInfo(info: FileInfo): Promise<any> {
     const newFile = {
       user_id: this.supabase.auth.user().id,
       title: info.title,
       private: info.private,
       file_name: info.file_name
     };

     return this.supabase.from(FILE_DB).insert(newFile);
   }

   //Helper
   private dataUrlToFile(dataUrl: string, fileName: string = 'myfile'): Promise<File> {
     return fetch(`data:model/sav;base64,${dataUrl}`)
      .then(res => res.blob())
      .then(blob => {
        return new File([blob], fileName, { type: 'model/sav '})
      })
   }
}
