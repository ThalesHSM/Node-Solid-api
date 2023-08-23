import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { InMemoryCheckInsRepository } from '@/repositories/in-memory/in-memory-check-ins-repository'
import { CheckInUseCase } from './check-in'
import { InMemoryGymsRepository } from '@/repositories/in-memory/in-memory-gyms-repository'
import { MaxNumberOfCheckInsError } from './errors/max-number-of-check-ins-error'
import { MaxDistanceError } from './errors/max-distance-error'

let checkInsRepository: InMemoryCheckInsRepository
let gymsRepository: InMemoryGymsRepository
let sut: CheckInUseCase

describe('Check-in use case', () => {
  beforeEach(async () => {
    checkInsRepository = new InMemoryCheckInsRepository()
    gymsRepository = new InMemoryGymsRepository()
    sut = new CheckInUseCase(checkInsRepository, gymsRepository)

    await gymsRepository.create({
      id: 'gym-01',
      title: 'Academy',
      description: '',
      phone: '',
      latitude: -27.2092052,
      longitude: -49.4889672,
    })

    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('Should be able to check in', async () => {
    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -27.2092052,
      userLongitude: -49.4889672,
    })

    expect(checkIn.id).toEqual(expect.any(String))
  })
  it('Should not be able to check in twice in the same day', async () => {
    vi.setSystemTime(new Date(2023, 0, 20, 8, 0, 0))
    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -27.2092052,
      userLongitude: -49.4889672,
    })

    await expect(() =>
      sut.execute({
        gymId: 'gym-01',
        userId: 'user-01',
        userLatitude: -27.2092052,
        userLongitude: -49.4889672,
      }),
    ).rejects.toBeInstanceOf(MaxNumberOfCheckInsError)
  })
  it('Should be able to check in twice in differents days', async () => {
    vi.setSystemTime(new Date(2023, 0, 20, 8, 0, 0))
    await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -27.2092052,
      userLongitude: -49.4889672,
    })
    vi.setSystemTime(new Date(2023, 0, 21, 8, 0, 0))

    const { checkIn } = await sut.execute({
      gymId: 'gym-01',
      userId: 'user-01',
      userLatitude: -27.2092052,
      userLongitude: -49.4889672,
    })
    expect(checkIn.id).toEqual(expect.any(String))
  })
  it('Should not be able to check in on distant gym', async () => {
    await gymsRepository.create({
      id: 'gym-02',
      title: 'Academy',
      description: '',
      phone: '',
      latitude: -27.2092052,
      longitude: -49.4889672,
    })
    await expect(() =>
      sut.execute({
        gymId: 'gym-01',
        userId: 'user-01',
        userLatitude: -22.1517867,
        userLongitude: -48.8934809,
      }),
    ).rejects.toBeInstanceOf(MaxDistanceError)
  })
})
