import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FileModalPage } from './file-modal.page';

const routes: Routes = [
  {
    path: '',
    component: FileModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FileModalPageRoutingModule {}
