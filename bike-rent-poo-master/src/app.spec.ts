import sinon from "sinon"
import { App } from "./app"
import { Bike } from "./bike"
import { User } from "./user"
import { Location } from "./location"
import { BikeNotFoundError } from "./errors/bike-not-found-error"
import { UnavailableBikeError } from "./errors/unavailable-bike-error"
import { UserNotFoundError } from "./errors/user-not-found-error"

describe('App', () => {
  it('should correctly calculate the rent amount', async () => {
    const app = new App()
    const user = new User('Jose', 'jose@mail.com', '1234')
    await app.registerUser(user)
    const bike = new Bike('caloi mountainbike', 'mountain bike',
      1234, 1234, 100.0, 'My bike', 5, [])
    app.registerBike(bike)
    const clock = sinon.useFakeTimers();
    app.rentBike(bike.id, user.email)
    const hour = 1000 * 60 * 60
    clock.tick(2 * hour)
    const rentAmount = app.returnBike(bike.id, user.email)
    expect(rentAmount).toEqual(200.0)
  })

  it('should be able to move a bike to a specific location', () => {
    const app = new App()
    const bike = new Bike('caloi mountainbike', 'mountain bike',
      1234, 1234, 100.0, 'My bike', 5, [])
    app.registerBike(bike)
    const newYork = new Location(40.753056, -73.983056)
    app.moveBikeTo(bike.id, newYork)
    expect(bike.location.latitude).toEqual(newYork.latitude)
    expect(bike.location.longitude).toEqual(newYork.longitude)
  })

  it('should throw an exception when trying to move an unregistered bike', () => {
    const app = new App()
    const newYork = new Location(40.753056, -73.983056)
    expect(() => {
      app.moveBikeTo('fake-id', newYork)
    }).toThrow(BikeNotFoundError)
  })

  it('should throw an exception when trying to move an unregistered bike', () => {
    const app = new App();
    const bike = new Bike('Caloi mountainbike', 'mountain bike', 1234, 1234, 100.0, 'My bike', 5, []);

    // Defina o comportamento esperado usando uma função de teste
    const testFunction = () => {
      app.moveBikeTo(bike.id, new Location(40.753056, -73.983056));
    };

    // Verifique se a função de teste lança uma exceção BikeNotFoundError
    expect(testFunction).toThrowError(BikeNotFoundError);
  });

  it('should correctly handle a bike rent', async () => {
    const app = new App()
    const user = new User('Jose', 'jose@mail.com', '1234')
    await app.registerUser(user)
    const bike = new Bike('caloi mountainbike', 'mountain bike',
      1234, 1234, 100.0, 'My bike', 5, [])
    app.registerBike(bike)
    app.rentBike(bike.id, user.email)
    expect(app.rents.length).toEqual(1)
    expect(app.rents[0].bike.id).toEqual(bike.id)
    expect(app.rents[0].user.email).toEqual(user.email)
    expect(bike.available).toBeFalsy()
  })

  it('should throw unavailable bike when trying to rent with an unavailable bike', async () => {
    const app = new App()
    const user = new User('Jose', 'jose@mail.com', '1234')
    await app.registerUser(user)
    const bike = new Bike('caloi mountainbike', 'mountain bike',
      1234, 1234, 100.0, 'My bike', 5, [])
    app.registerBike(bike)
    app.rentBike(bike.id, user.email)
    expect(() => {
      app.rentBike(bike.id, user.email)
    }).toThrow(UnavailableBikeError)
  })

  it('should throw user not found error when user is not found', () => {
    const app = new App()
    expect(() => {
      app.findUser('fake@mail.com')
    }).toThrow(UserNotFoundError)
  })

  //teste de registro de usuario
  //verifica se o registro de usuário funciona corretamente e se lida com casos de usuário duplicado
  it('should register a user and handle duplicate users', async () => {
    const app = new App();

    const user1 = new User('Jose', 'jose@mail.com', '1234');
    const userId1 = await app.registerUser(user1);

    // tentativa de registrar o mesmo usuário novamente
    const user2 = new User('Jose', 'jose@mail.com', '1234');

    const testFunction = async () => {
      await app.registerUser(user2);
    };
    expect(testFunction).rejects.toThrowError(UserAlreadyExistsError);

    // confere se o primeiro usuário foi registrado
    const registeredUser1 = app.findUser('jose@mail.com');
    expect(registeredUser1).toBeDefined();
    expect(registeredUser1.id).toEqual(userId1);
  });

  //teste de autenticacao de usuario
  it('should authenticate a registered user', async () => {
    const app = new App();

    const user1 = new User('Jose', 'jose@mail.com', '1234');
    await app.registerUser(user1);

    // tenta autenticar o usuário com a senha correta
    const authenticated1 = await app.authenticate('jose@mail.com', '1234');
    expect(authenticated1).toBe(true);

    // tenta autenticar o usuário com a senha incorreta
    const authenticated2 = await app.authenticate('jose@mail.com', '123456');
    expect(authenticated2).toBe(false);

    // tenta autenticar um usuário não registrado
    const authenticated3 = await app.authenticate('joao@mail.com', '1234');
    expect(authenticated3).toBe(false);
  });

  // teste de registro de bicicleta
  it('should register a bike', () => {
    const app = new App();

    // registrando uma nova bicicleta
    const bike = new Bike('Caloi mountainbike', 'mountain bike', 1234, 1234, 100.0, 'My bike', 5, []);
    const bikeId = app.registerBike(bike);

    // verifica se a bicicleta foi registrada com sucesso
    const registeredBike = app.findBike(bikeId);
    expect(registeredBike).toBeDefined();
    expect(registeredBike.id).toEqual(bikeId);
  });

  // teste de remocao de usuario
  it('should remove a registered user', () => {
    const app = new App();

    // novo usuario
    const user = new User('Maria', 'maria@mail.com', '1234');
    app.registerUser(user);

    // remove usuario registrado
    app.removeUser('maria@mail.com');

    // verifica se o usuário foi realmente removido
    const removedUser = app.findUser('maria@mail.com');
    expect(removedUser).toBeUndefined();
  });
})
