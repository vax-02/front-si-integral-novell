import { Component } from '@angular/core';
import { ButtonComponent } from "../../shared/button/button.component";
import { UserService } from "../../service/user.service";
@Component({
  selector: 'app-users',
  imports: [ButtonComponent],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  constructor(private userService: UserService) { }
  ngOnInit(): void {
  }
  loadUsers() {
    /*this.userService.getUsers().subscribe((users) => {
      console.log(users);
    });*/
  }
}
