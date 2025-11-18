import express from 'express';
import prisma from '../prismaClient.js';

const router = express.Router();

const stringOrNull = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const extractBilingual = (payload = {}, key) => {
  const en = stringOrNull(payload[`${key}En`]);
  const fa = stringOrNull(payload[`${key}Fa`]);
  const canonical = stringOrNull(payload[key]) ?? fa ?? en ?? null;
  return { canonical, en, fa };
};

// GET team members
router.get('/', async (req, res) => {
  try {
    // Admin panel passes includeInactive=true to see all members
    // Public API only gets active members
    const includeInactive = req.query.includeInactive === 'true';
    const where = includeInactive ? {} : { active: true };
    const members = await prisma.teamMember.findMany({ 
      where,
      orderBy: { createdAt: 'desc' } 
    });
    res.json(members);
  } catch (e) {
    res.status(500).json({ error: 'list_failed' });
  }
});

// POST create team member
router.post('/', async (req, res) => {
  const { name, nameEn, nameFa, role, roleEn, roleFa, bio, bioEn, bioFa, image, active } = req.body;
  
  const nameData = extractBilingual({ name, nameEn, nameFa }, 'name');
  const roleData = extractBilingual({ role, roleEn, roleFa }, 'role');
  const bioData = extractBilingual({ bio, bioEn, bioFa }, 'bio');
  
  if (!nameData.canonical || !roleData.canonical) {
    return res.status(400).json({ error: 'missing_fields' });
  }
  
  try {
    const created = await prisma.teamMember.create({ 
      data: { 
        name: nameData.canonical,
        nameEn: nameData.en,
        nameFa: nameData.fa,
        role: roleData.canonical,
        roleEn: roleData.en,
        roleFa: roleData.fa,
        bio: bioData.canonical,
        bioEn: bioData.en,
        bioFa: bioData.fa,
        image: stringOrNull(image),
        active: active ?? true 
      } 
    });
    res.status(201).json(created);
  } catch (e) {
    console.error('[team POST] Error:', e.message);
    res.status(500).json({ error: 'create_failed' });
  }
});

// PUT update member
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, nameEn, nameFa, role, roleEn, roleFa, bio, bioEn, bioFa, image, active } = req.body;
  
  try {
    const updateData = {};
    
    // Handle name updates
    if (name !== undefined || nameEn !== undefined || nameFa !== undefined) {
      const nameData = extractBilingual({ name, nameEn, nameFa }, 'name');
      if (nameData.canonical) {
        updateData.name = nameData.canonical;
        updateData.nameEn = nameData.en;
        updateData.nameFa = nameData.fa;
      }
    }
    
    // Handle role updates
    if (role !== undefined || roleEn !== undefined || roleFa !== undefined) {
      const roleData = extractBilingual({ role, roleEn, roleFa }, 'role');
      if (roleData.canonical) {
        updateData.role = roleData.canonical;
        updateData.roleEn = roleData.en;
        updateData.roleFa = roleData.fa;
      }
    }
    
    // Handle bio updates
    if (bio !== undefined || bioEn !== undefined || bioFa !== undefined) {
      const bioData = extractBilingual({ bio, bioEn, bioFa }, 'bio');
      updateData.bio = bioData.canonical;
      updateData.bioEn = bioData.en;
      updateData.bioFa = bioData.fa;
    }
    
    // Handle image update
    if (image !== undefined) {
      updateData.image = stringOrNull(image);
    }
    
    // Handle active status
    if (active !== undefined) {
      updateData.active = active;
    }
    
    const updated = await prisma.teamMember.update({
      where: { id },
      data: updateData,
    });
    res.json(updated);
  } catch (e) {
    console.error('[team PUT] Error:', e.message);
    res.status(404).json({ error: 'not_found' });
  }
});

// DELETE member
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.teamMember.delete({ where: { id } });
    res.json({ deleted: id });
  } catch (e) {
    res.status(404).json({ error: 'not_found' });
  }
});

export default router;
