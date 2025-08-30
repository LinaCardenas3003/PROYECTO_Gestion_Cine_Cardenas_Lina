export default class UserCreateDto{
    constructor(data){
        this.id = data.id;
        this.name = data.name;
        this.phone = data.phone;
        this.email = data.email;
        this.position = data.position;
        this.password = data.password;
        this.role = data.role || 'user';
        this.createdAt = new Date();
    }
}
