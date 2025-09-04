export default class ClientDto {
    constructor(data) {
        this.identification = data.identification;
        this.fullName = data.fullName;
        this.email = data.email;
        this.phone = data.phone;
        this.createdAt = new Date();
    }
}
