export default class ProfileDto {
    constructor(data) {
        this._id = data._id;
        this.name = data.name;
        this.phone = data.phone;
        this.email = data.email;
        this.position = data.position;
        this.role = data.role; 
    }
}
