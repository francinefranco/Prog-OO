import { Rent } from "../rent";
import { RentRepo } from "./rent-repo";

export class FakeRentRepo implements RentRepo {
    private rents: Rent[] = [];

    async add(rent: Rent): Promise<string> {
        return rent.id; 
    }

    async findOpen(bikeId: string, userEmail: string): Promise<Rent> {
        return this.rents.find(rent => rent.bikeId === bikeId && rent.userEmail === userEmail && !rent.end);
    }

    async update(id: string, rent: Rent): Promise<void> {
        const index = this.rents.findIndex(existingRent => existingRent.id === id);
        if (index !== -1) {
            this.rents[index] = rent;
        }
    }

    async findOpenRentsFor(userEmail: string): Promise<Rent[]> {
        return this.rents.filter(rent => {
            return rent.user.email === userEmail && !rent.end;
        });
    }
}