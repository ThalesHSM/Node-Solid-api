import { describe, it, expect, beforeEach } from 'vitest'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { CreateGymUseCase } from './create-gym'

let usersRepository: InMemoryGymsRepository
let sut: CreateGymUseCase

describe('Create gym use case', () => {
  beforeEach(() => {
    usersRepository = new InMemoryGymsRepository()
    sut = new CreateGymUseCase(usersRepository)
  })
  it('Should be able to create gym', async () => {
    const { gym } = await sut.execute({
      title: 'Javascript Gym',
      description: null,
      phone: null,
      latitude: -27.2092052,
      longitude: -49.4889672,
    })

    expect(gym.id).toEqual(expect.any(String))
  })
})
