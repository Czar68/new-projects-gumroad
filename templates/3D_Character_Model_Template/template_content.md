# **Complete 3D Character Model Template for Digital Creators**

## **Overview**
This template provides a standardized structure and workflow for creating production-ready 3D character models. Designed for modularity and pipeline integration, it supports games, animation, VR, and real-time applications.

---

## **≡ƒôü TEMPLATE STRUCTURE**

```
3D_Character_Template/
Γöé
Γö£ΓöÇΓöÇ ≡ƒôü 01_Reference/
Γöé   Γö£ΓöÇΓöÇ ≡ƒôü Concept_Art/
Γöé   Γö£ΓöÇΓöÇ ≡ƒôü Inspiration/
Γöé   Γö£ΓöÇΓöÇ ≡ƒôü Turnarounds/
Γöé   ΓööΓöÇΓöÇ reference_sheet.psd
Γöé
Γö£ΓöÇΓöÇ ≡ƒôü 02_Modeling/
Γöé   Γö£ΓöÇΓöÇ ≡ƒôü High_Poly/
Γöé   Γöé   Γö£ΓöÇΓöÇ body_hp.zbp
Γöé   Γöé   Γö£ΓöÇΓöÇ clothing_hp.obj
Γöé   Γöé   ΓööΓöÇΓöÇ accessories_hp.fbx
Γöé   Γöé
Γöé   Γö£ΓöÇΓöÇ ≡ƒôü Low_Poly/
Γöé   Γöé   Γö£ΓöÇΓöÇ body_lp.fbx
Γöé   Γöé   Γö£ΓöÇΓöÇ clothing_lp.fbx
Γöé   Γöé   ΓööΓöÇΓöÇ LODs/
Γöé   Γöé
Γöé   ΓööΓöÇΓöÇ ≡ƒôü Retopology/
Γöé       ΓööΓöÇΓöÇ retopo_guide.txt
Γöé
Γö£ΓöÇΓöÇ ≡ƒôü 03_UV_Texturing/
Γöé   Γö£ΓöÇΓöÇ ≡ƒôü UV_Layouts/
Γöé   Γöé   Γö£ΓöÇΓöÇ body_uv.psd
Γöé   Γöé   ΓööΓöÇΓöÇ uv_check_texture.png
Γöé   Γöé
Γöé   Γö£ΓöÇΓöÇ ≡ƒôü Textures/
Γöé   Γöé   Γö£ΓöÇΓöÇ ≡ƒôü PBR/
Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ BaseColor/
Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ Normal/
Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ Roughness/
Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ Metallic/
Γöé   Γöé   Γöé   ΓööΓöÇΓöÇ AmbientOcclusion/
Γöé   Γöé   Γöé
Γöé   Γöé   Γö£ΓöÇΓöÇ ≡ƒôü Stylized/
Γöé   Γöé   ΓööΓöÇΓöÇ texture_naming_convention.txt
Γöé   Γöé
Γöé   ΓööΓöÇΓöÇ ≡ƒôü Substance_Files/
Γöé       ΓööΓöÇΓöÇ material_library.sbs
Γöé
Γö£ΓöÇΓöÇ ≡ƒôü 04_Rigging/
Γöé   Γö£ΓöÇΓöÇ ≡ƒôü Rigs/
Γöé   Γöé   Γö£ΓöÇΓöÇ basic_rig.fbx
Γöé   Γöé   Γö£ΓöÇΓöÇ advanced_rig.fbx
Γöé   Γöé   ΓööΓöÇΓöÇ facial_rig.fbx
Γöé   Γöé
Γöé   Γö£ΓöÇΓöÇ ≡ƒôü Skinning/
Γöé   Γöé   ΓööΓöÇΓöÇ weight_maps/
Γöé   Γöé
Γöé   ΓööΓöÇΓöÇ control_naming_convention.txt
Γöé
Γö£ΓöÇΓöÇ ≡ƒôü 05_Animation/
Γöé   Γö£ΓöÇΓöÇ ≡ƒôü Base_Poses/
Γöé   Γö£ΓöÇΓöÇ ≡ƒôü Cycles/
Γöé   Γöé   Γö£ΓöÇΓöÇ walk.fbx
Γöé   Γöé   Γö£ΓöÇΓöÇ run.fbx
Γöé   Γöé   ΓööΓöÇΓöÇ idle.fbx
Γöé   Γöé
Γöé   ΓööΓöÇΓöÇ ≡ƒôü Facial_Expressions/
Γöé
Γö£ΓöÇΓöÇ ≡ƒôü 06_Export/
Γöé   Γö£ΓöÇΓöÇ ≡ƒôü Game_Engine/
Γöé   Γöé   Γö£ΓöÇΓöÇ ≡ƒôü Unity/
Γöé   Γöé   ΓööΓöÇΓöÇ ≡ƒôü Unreal/
Γöé   Γöé
Γöé   Γö£ΓöÇΓöÇ ≡ƒôü Render/
Γöé   Γöé   Γö£ΓöÇΓöÇ ≡ƒôü Marmoset/
Γöé   Γöé   ΓööΓöÇΓöÇ ≡ƒôü Blender_Cycles/
Γöé   Γöé
Γöé   ΓööΓöÇΓöÇ export_settings.json
Γöé
Γö£ΓöÇΓöÇ ≡ƒôü 07_Documentation/
Γöé   Γö£ΓöÇΓöÇ character_spec_sheet.pdf
Γöé   Γö£ΓöÇΓöÇ technical_requirements.txt
Γöé   ΓööΓöÇΓöÇ style_guide.md
Γöé
ΓööΓöÇΓöÇ ≡ƒôü 08_Software_Specific/
    Γö£ΓöÇΓöÇ ≡ƒôü Blender/
    Γö£ΓöÇΓöÇ ≡ƒôü Maya/
    Γö£ΓöÇΓöÇ ≡ƒôü ZBrush/
    ΓööΓöÇΓöÇ ≡ƒôü Substance_Painter/
```

---

## **≡ƒô¥ DETAILED INSTRUCTIONS**

### **1. Reference Stage**
- **Purpose**: Establish visual direction and technical specifications
- **Files to include**:
  - Orthographic views (front, side, back)
  - Color palette (hex values)
  - Material callouts
  - Scale reference (human = 180 units)

### **2. Modeling Guidelines**

#### **High-Poly Modeling**
- **Software**: ZBrush/Blender/Maya
- **Requirements**:
  - Maintain 4+ subdivision levels
  - Clean topology with no artifacts
  - Preserve hard edges where needed
  - Export as `.obj` with smoothing groups

#### **Low-Poly Modeling**
- **Triangle Count Targets**:
  - Mobile: 5K-15K tris
  - PC/Console: 20K-50K tris
  - Cinematic: 50K-100K tris
- **Topology Rules**:
  - Quads preferred, triangles allowed in non-deforming areas
  - Edge loops follow muscle flow
  - Maintain even polygon distribution
  - No n-gons or poles in deforming areas

### **3. UV Mapping Standards**
- **Texture Size Guidelines**:
  - 2048x2048 for hero characters
  - 1024x1024 for secondary
  - 512x512 for props
- **UV Layout Rules**:
  - Maintain consistent texel density
  - Keep important areas in less distorted UV space
  - 2-8 pixel padding between islands
  - Straighten edges where possible

### **4. Texturing Workflow**

#### **PBR Texture Set (Metallic/Roughness)**
```
Naming Convention:
CharacterName_Diffuse.png
CharacterName_Normal.png
CharacterName_Roughness.png
CharacterName_Metallic.png
CharacterName_AO.png
CharacterName_Height.png (optional)
```

#### **Substance Painter Best Practices**
1. Start with base materials
2. Add wear and tear with masks
3. Use generators for edge wear
4. Export with appropriate color spaces:
   - sRGB: Albedo/Diffuse
   - Linear: Roughness/Metallic/AO
   - DirectX: Normal maps

### **5. Rigging Standards**

#### **Bone Naming Convention**
```
prefix_jointName_side_position
Example: CH_Spine_MID_01
```
- **Prefix**: Character identifier
- **Side**: L (left), R (right), C (center)
- **Position**: 01, 02, etc.

#### **Facial Rig Setup**
- Blend shapes for primary expressions
- Jaw, eye, and eyebrow controls
- Corrective shapes for phonemes

### **6. Export Settings**

#### **FBX Export (Maya/Blender)**
```
Units: Centimeters
Up Axis: Y
Smoothing: Normals Only
Embed Media: Γ£ô
Animation: Γ£ô (if rigged)
```

#### **Unity Import Settings**
```
Scale Factor: 0.01
Mesh Compression: Off
Read/Write Enabled: Γ£ô
Optimize Mesh: Γ£ô
```

---

## **≡ƒÄ¿ EXAMPLES**

### **Example 1: Stylized Character Workflow**
```
1. Sculpt high-poly in ZBrush (2M polys)
2. Retopologize in Maya (25K tris)
3. UV in RizomUV (2K texture set)
4. Texture in Substance Painter
5. Rig in Blender (Auto-Rig Pro)
6. Export to Unity (FBX 2018)
```

### **Example 2: PBR Material Values**
```json
{
  "skin_material": {
    "albedo": "#FFC8B4",
    "roughness": 0.65,
    "subsurface": 0.3
  },
  "metal_material": {
    "albedo": "#666666",
    "roughness": 0.4,
    "metallic": 1.0
  }
}
```

### **Example 3: Animation Export Preset**
```python
# Blender Python Export Script
import bpy

bpy.ops.export_scene.fbx(
    filepath="character_animated.fbx",
    use_selection=False,
    global_scale=0.01,
    apply_unit_scale=True,
    bake_anim=True,
    bake_anim_use_all_bones=True
)
```

---

## **Γ£à BEST PRACTICES CHECKLIST**

### **Modeling**
- [ ] Clean topology with proper edge flow
- [ ] No duplicate vertices or faces
- [ ] Properly named objects and materials
- [ ] Scale matches real-world units
- [ ] Pivot points at character origin

### **Texturing**
- [ ] Non-power-of-two textures avoided
- [ ] Normal maps generated from high-poly
- [ ] No seams visible in final render
- [ ] Consistent lighting across textures
- [ ] Proper alpha channels where needed

### **Rigging**
- [ ] Joint hierarchy properly organized
- [ ] Skin weights painted smoothly
- [ ] Controllers intuitive and labeled
- [ ] Zero transforms on bind pose
- [ ] Tested with extreme poses

### **Optimization**
- [ ] LODs created (3-4 levels)
- [ ] Occlusion culling considered
- [ ] Texture atlases used where possible
- [ ] Mesh instancing for duplicates
- [ ] Draw calls minimized

---

## **ΓÜá∩╕Å COMMON PITFALLS & SOLUTIONS**

| Problem | Solution |
|---------|----------|
| Normal map seams | Ensure consistent smoothing groups |
| Texture stretching | Check UV island scaling |
| Rig deformation issues | Add more edge loops at joints |
| Export scale problems | Reset transforms before export |
| Performance issues | Use texture compression and LODs |

---

## **≡ƒöº SOFTWARE-SPECIFIC TIPS**

### **Blender**
- Use Collections for organization
- Apply all transforms before export
- Enable "Face Orientation" overlay to check normals

### **Maya**
- Freeze transformations before rigging
- Use reference edits for non-destructive workflow
- Clean history before export

### **Substance Painter**
- Use anchor points for reusable details
- Export with output templates
- Utilize curvature and ambient occlusion maps

---

## **≡ƒôè POLYCOUNT TRACKING TEMPLATE**

```markdown
## Character: [Name]
| Component | High-Poly | Low-Poly | Texture Size | Notes |
|-----------|-----------|----------|--------------|-------|
| Body      |           |          |              |       |
| Clothing  |           |          |              |       |
| Hair      |           |          |              |       |
| Accessories |         |          |              |       |
| **TOTAL** |           |          |              |       |
```

---

## **≡ƒÜÇ QUICK START**

1. **Duplicate** the template folder structure
2. **Place** reference images in `01_Reference`
3. **Begin** sculpting/modeling in `02_Modeling`
4. **Follow** naming conventions strictly
5. **Test** exports frequently
6. **Document** any deviations in `07_Documentation`

---

## **≡ƒôÜ ADDITIONAL RESOURCES**

- **Polycount Wiki**: Industry standards forum
- **ArtStation Learning**: Free tutorial courses
- **Blender Market**: Tools and assets
- **Substance Academy**: PBR workflow guides

---

## **≡ƒöä VERSION CONTROL**

```
v1.0 - Base template
v1.1 - Added facial rig structure
v1.2 - Updated export guidelines
[Add your versions here]
```

---

## **LICENSE**
This template is provided under CC0 1.0 Universal (Public Domain). Modify and distribute freely. Attribution appreciated but not required.

---

*Last Updated: [Current Date]*  
*Template Version: 1.2*  
*Compatible with: Blender 3.0+, Maya 2022+, Substance 3D 8.0+*

**Happy Creating! ≡ƒÄ«≡ƒÄ¿Γ£¿**
