import { NextRequest } from 'next/server';
import { GET as getOrganisations } from '@/app/api/organisations/route';
import { GET as getOrgDetail } from '@/app/api/organisations/[id]/route';
import { createMocks } from 'node-mocks-http';
import prisma from '@/lib/db';

// Mock auth module entirely to avoid Jose ESM issues in Jest
jest.mock('@/lib/auth', () => ({
    getSession: jest.fn(),
}));

import { getSession } from '@/lib/auth';

describe('RBAC Integration Tests', () => {
  let orgId: string;
  let otherOrgId: string;

  beforeAll(async () => {
    // 1. Setup Data
    const org = await prisma.organisation.create({ data: { name: 'Test Org 1', nis2_segment: 'Essential' } });
    const otherOrg = await prisma.organisation.create({ data: { name: 'Test Org 2', nis2_segment: 'Important' } });
    orgId = org.id;
    otherOrgId = otherOrg.id;
  });

  afterAll(async () => {
    await prisma.organisation.deleteMany({ where: { id: { in: [orgId, otherOrgId] } } });
  });

  const setupSession = (role: 'consultant' | 'client', organisationId: string | null) => {
    (getSession as jest.Mock).mockResolvedValue({
        userId: 'test-user',
        email: 'test@example.com',
        role,
        organisationId
    });
  };

  test('Consultant can list all organisations', async () => {
    setupSession('consultant', null);
    const req = new NextRequest('http://localhost:3000/api/organisations');
    const res = await getOrganisations(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.some((o: any) => o.id === orgId)).toBe(true);
  });

  test('Client CANNOT list organisations', async () => {
    setupSession('client', orgId);
    const req = new NextRequest('http://localhost:3000/api/organisations');
    const res = await getOrganisations(req);
    expect(res.status).toBe(403);
  });

  test('Consultant can access any org detail', async () => {
    setupSession('consultant', null);
    const req = new NextRequest(`http://localhost:3000/api/organisations/${orgId}`);
    const res = await getOrgDetail(req, { params: Promise.resolve({ id: orgId }) });
    expect(res.status).toBe(200);
  });

  test('Client can access their OWN org detail', async () => {
    setupSession('client', orgId);
    const req = new NextRequest(`http://localhost:3000/api/organisations/${orgId}`);
    const res = await getOrgDetail(req, { params: Promise.resolve({ id: orgId }) });
    expect(res.status).toBe(200);
  });

  test('Client CANNOT access OTHER org detail', async () => {
    setupSession('client', orgId);
    const req = new NextRequest(`http://localhost:3000/api/organisations/${otherOrgId}`);
    const res = await getOrgDetail(req, { params: Promise.resolve({ id: otherOrgId }) });
    expect(res.status).toBe(403);
  });
});
