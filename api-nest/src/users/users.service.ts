import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
    private users:any = [];
    findAll() {
        return this.users;
    }
    create(name: string) {
        let user = { id: Date.now(), name };
        this.users.push(user);
        return user;
    }
}