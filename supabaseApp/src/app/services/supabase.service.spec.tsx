import { async, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';

import { FileItem, FILE_DB, SupabaseService } from './supabase.service';

describe('SupabaseService', () => {
  let service: SupabaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupabaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

new Promise ( loadFiles()) {
  const query = await this.supabase.from(FILE_DB).select('*').order('created_at', { ascending: false });

  // Set some custom data for each item
  const data: FileItem[] = query.data.map(item => {
    item.image_url = this.getImageForFile(item);
    item.creator = item.user_id == this.supabase.auth.user().id;
    return item;
  });

  // Divide by private and public
  const privateFiles = data.filter(item => item.private);
  const publicFiles = data.filter(item => !item.private);

  this.privateFiles.next(privateFiles);
  this.publicFiles.next(publicFiles);
}

getPublicFiles(): Observable<FileItem[]> {
  return this.publicFiles.asObservable();
}

getPrivateFiles(): Observable<FileItem[]> {
  return this.privateFiles.asObservable();
}

// Remove a file and the DB record
async removeFileEntry(item: FileItem): Promise<void> {
  const bucketName = item.private ? 'private' : 'public';

  await this.supabase
    .from(FILE_DB)
    .delete()
    .match({ id: item.id });

  await this.supabase
    .storage
    .from(bucketName)
    .remove([item.file_name]);
}

// Get the Image URL for a file inside a bucket
getImageForFile(item: FileItem) {
  const bucketName = item.private ? 'private' : 'public';

  return this.supabase.storage.from(bucketName).download(item.file_name).then(res => {
    const url = URL.createObjectURL(res.data);
    const imageUrl = this.sanitizer.bypassSecurityTrustUrl(url);
    return imageUrl;
  });
}

// Realtime change listener
handleDbChanged() {
  return this.supabase
    .from(FILE_DB)
    .on('*', payload => {
      console.log('Files realtime changed: ', payload);
      if (payload.eventType == 'INSERT') {
        // Add the new item
        const newItem: FileItem = payload.new;
        newItem.creator = newItem.user_id == this.supabase.auth.user().id;

        if (newItem.private && newItem.user_id == this.supabase.auth.user().id) {
          newItem.image_url = this.getImageForFile(newItem);
          this.privateFiles.next([newItem, ...this.privateFiles.value]);
        } else if (!newItem.private) {
          newItem.image_url = this.getImageForFile(newItem);
          this.publicFiles.next([newItem, ...this.publicFiles.value]);
        }
      } else if (payload.eventType == 'DELETE') {
        // Filter out the removed item
        const oldItem: FileItem = payload.old;
        if (oldItem.private && oldItem.user_id == this.supabase.auth.user().id) {
          const newValue = this.privateFiles.value.filter(item => oldItem.id != item.id);
          this.privateFiles.next(newValue);
        } else if (!oldItem.private) {
          const newValue = this.publicFiles.value.filter(item => oldItem.id != item.id);
          this.publicFiles.next(newValue);
        }
      }
    }).subscribe();
}
