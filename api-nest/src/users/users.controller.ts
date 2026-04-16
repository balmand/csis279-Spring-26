import { Body, Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {

    constructor(private usersService: UsersService) { }

    @Get()
    getAll() {
        return this.usersService.findAll();
    }

    @Post()
    create(@Body('name') name: string) {
        return this.usersService.create(name);
    }
}
