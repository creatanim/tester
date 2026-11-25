"""
blender_scene.py — عالم عينة "Why Perfect Railroads Don't Work" (10 ثوانٍ)
يبنى من plan.json بمناطق مفصولة:
  Zone A  (plan z 1..5.5)    الممر المظلم + سكة بفجوات منشورة + مهندس
  Zone B  (plan z 149..157)  فوهة النفق + القاطرة رقم 7 (تعبر حالياً)
  Zone C  (plan z 270..330)  الكanyon + نهر + جسر خشبي + قطاران يتسابقان
  Zone D  (plan z 430..460)  حافة مظلمة + صحراء + لافتة خط النهاية
التحويل: plan [x, y_up, z] -> blender [x, -z, y_up]
"""
import math
import random
import bpy
from mathutils import Vector

RNG = random.Random(7)


def pb(x, y, z):
    """plan -> blender"""
    return (float(x), -float(z), float(y))


def srgb(hex_str):
    h = hex_str.lstrip("#")
    vals = []
    for i in (0, 2, 4):
        c = int(h[i:i + 2], 16) / 255.0
        lin = c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
        vals.append(lin)
    return (vals[0], vals[1], vals[2], 1.0)


def mat(name, hex_col, rough=0.68, metal=0.0, bump=0.0, bump_strength=0.3):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    b = nt.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = srgb(hex_col)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if bump > 0:
        tex = nt.nodes.new("ShaderNodeTexNoise")
        tex.inputs["Scale"].default_value = bump
        tex.inputs["Detail"].default_value = 5.0
        bmp = nt.nodes.new("ShaderNodeBump")
        bmp.inputs["Strength"].default_value = bump_strength
        nt.links.new(tex.outputs["Fac"], bmp.inputs["Height"])
        nt.links.new(bmp.outputs["Normal"], b.inputs["Normal"])
    return m


def emissive(name, hex_col, strength=6.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get("Principled BSDF")
    b.inputs["Base Color"].default_value = srgb(hex_col)
    b.inputs["Emission Color"].default_value = srgb(hex_col)
    b.inputs["Emission Strength"].default_value = strength
    return m


def box(name, plan_aabb, material, bevel=0.04, rot_y=0.0):
    x0, y0, z0, x1, y1, z1 = plan_aabb
    cx, cy, cz = pb((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(cx, cy, cz))
    o = bpy.context.active_object
    o.name = name
    o.scale = (max(0.03, x1 - x0), max(0.03, z1 - z0), max(0.03, y1 - y0))
    o.rotation_euler[1] = rot_y
    o.data.materials.append(material)
    if bevel > 0:
        bv = o.modifiers.new("Bevel", "BEVEL")
        bv.width = bevel
        bv.segments = 2
    return o


def cyl(name, plan_c, radius, depth, material, axis="Z", verts=24):
    cx, cy, cz = pb(*plan_c)
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=radius, depth=depth, location=(cx, cy, cz))
    o = bpy.context.active_object
    o.name = name
    if axis == "X":
        o.rotation_euler[1] = math.pi / 2
    elif axis == "Z":  # plan z (along track) -> blender Y
        o.rotation_euler[0] = math.pi / 2
    o.data.materials.append(material)
    return o


# ============================================================
# القاطرة رقم 7: هيئة سوداء + شريط ذهبي + عجلات حمراء مفتوحة السواعد
# ============================================================
def add_locomotive(prefix, x0, z0, state, heading=1):
    """x0 = front of loco in plan x, z0 = track center plan z. heading=+1 towards +x."""
    black = mat(prefix + "_blk", "#211d27", rough=0.42, metal=0.25)
    red = mat(prefix + "_red", "#b5301c", rough=0.5)
    gold = mat(prefix + "_gold", "#d8a24a", rough=0.35, metal=0.8)
    lamp = emissive(prefix + "_lamp", "#ffd98a", 18.0)

    objs = []
    # المرجل (boiler)
    objs.append(cyl(prefix + "_boiler", (x0 - 1.6, 1.62, z0), 0.92, 3.6, black, axis="X", verts=32))
    # أشرطة ذهبية على المرجل
    for i, bx in enumerate([-2.9, -1.9, -0.9]):
        objs.append(cyl(prefix + f"_band{i}", (x0 + bx + 1.0, 1.62, z0), 0.96, 0.12, gold, axis="X", verts=32))
    # الكابينة
    objs.append(box(prefix + "_cab", (x0 - 4.1, 0.55, z0 - 1.05, x0 - 2.4, 3.15, z0 + 1.05), black))
    objs.append(box(prefix + "_cabroof", (x0 - 4.35, 3.15, z0 - 1.25, x0 - 2.15, 3.38, z0 + 1.25), red))
    # المدخنة + القبة
    objs.append(cyl(prefix + "_stack", (x0 - 0.35, 2.75, z0), 0.30, 1.5, black, axis="Y", verts=20))
    objs.append(cyl(prefix + "_stacktop", (x0 - 0.35, 3.45, z0), 0.42, 0.28, black, axis="Y", verts=20))
    objs.append(cyl(prefix + "_dome", (x0 - 1.7, 2.62, z0), 0.42, 0.7, gold, axis="Y", verts=20))
    # المصباح الأمامي المتوهج
    objs.append(cyl(prefix + "_lampbody", (x0 + 0.28, 2.32, z0), 0.34, 0.36, gold, axis="X", verts=20))
    objs.append(cyl(prefix + "_lampglass", (x0 + 0.48, 2.32, z0), 0.26, 0.10, lamp, axis="X", verts=20))
    # عربة الفحم
    objs.append(box(prefix + "_tender", (x0 - 6.6, 0.55, z0 - 1.0, x0 - 4.25, 2.6, z0 + 1.0), black))
    objs.append(box(prefix + "_coal", (x0 - 6.35, 2.6, z0 - 0.75, x0 - 4.5, 2.95, z0 + 0.75), mat(prefix + "_coal", "#17141c", rough=0.95)))

    # مقدمة المزراب (cowcatcher) — قضبان مائلة
    for i in range(7):
        t = (i - 3) / 3.0
        objs.append(box(prefix + f"_cow{i}", (x0 + 0.35, 0.18, z0 - 1.15 + i * 0.38, x0 + 1.35, 0.30, z0 - 1.02 + i * 0.38), red, rot_y=t * 0.22))
    objs.append(box(prefix + "_footplate", (x0 - 4.15, 0.42, z0 - 1.15, x0 + 0.4, 0.60, z0 + 1.15), red))

    # عجلات مفتوحة السواعد مع محاور دوّارة (Empty pivots على محور Y)
    wheels = []
    def wheel_set(wx, r, count, spread):
        for side in (-1, 1):
            for k in range(count):
                cxw = wx - k * spread
                bpy.ops.object.empty_add(type="PLAIN_AXES", location=pb(cxw, r, z0 + side * 1.12))
                pivot = bpy.context.active_object
                pivot.name = prefix + f"_piv_{len(wheels)}"
                # إطار معدني (torus)
                bpy.ops.mesh.primitive_torus_add(major_radius=r * 0.86, minor_radius=r * 0.14,
                                                 major_segments=24, minor_segments=8,
                                                 location=pb(cxw, r, z0 + side * 1.12))
                tire = bpy.context.active_object
                tire.rotation_euler[0] = math.pi / 2
                tire.data.materials.append(red)
                tire.parent = pivot
                tire.matrix_parent_inverse = pivot.matrix_world.inverted()
                # قرص مركزي
                bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=r * 0.28, depth=0.16,
                                                    location=pb(cxw, r, z0 + side * 1.12))
                hub = bpy.context.active_object
                hub.rotation_euler[0] = math.pi / 2
                hub.data.materials.append(gold)
                hub.parent = pivot
                hub.matrix_parent_inverse = pivot.matrix_world.inverted()
                # سواعد الشعاع
                for s in range(8):
                    a = s * math.pi / 4
                    bpy.ops.mesh.primitive_cube_add(size=1.0, location=pb(cxw, r, z0 + side * 1.12))
                    sp = bpy.context.active_object
                    sp.scale = (0.05, 0.05, r * 1.55)
                    sp.rotation_euler[1] = a
                    sp.data.materials.append(red)
                    sp.parent = pivot
                    sp.matrix_parent_inverse = pivot.matrix_world.inverted()
                wheels.append(pivot)
        return wheels

    wheel_set(x0 - 3.15, 0.62, 3, 1.18)   # ثلاث عجلات كبيرة
    wheel_set(x0 - 0.62, 0.40, 1, 0.0)    # عجلة أمامية صغيرة
    return {"objs": objs, "wheels": wheels, "lamp": lamp, "base_x": x0}


def add_track(prefix, x0, x1, zc, ballast=True, gaps=None):
    """سكك حديدية: روابط خشبية + قضبان على مهد حصوي، مع فجوات منشورة (gaps=[(gx0,gx1),..])."""
    wood = mat(prefix + "_wood", "#5c3d28", rough=0.85, bump=18)
    steel = mat(prefix + "_steel", "#6d727c", rough=0.35, metal=0.85)
    bal = mat(prefix + "_bal", "#8a7c6c", rough=0.95, bump=10)
    gaps = gaps or []
    objs = []
    if ballast:
        objs.append(box(prefix + "_ballast", (x0, -0.02, zc - 1.05, x1, 0.16, zc + 1.05), bal))
    # الروابط الخشبية
    n = int((x1 - x0) / 0.62)
    for i in range(n + 1):
        lx = x0 + i * 0.62
        objs.append(box(prefix + f"_tie{i}", (lx - 0.11, 0.16, zc - 0.95, lx + 0.11, 0.27, zc + 0.95), wood, bevel=0.02))
    # القضبان — مع فجوات المنشور
    for side in (-0.72, 0.72):
        segs = []
        cur = x0
        for (g0, g1) in sorted(gaps):
            if g0 > cur:
                segs.append((cur, g0))
            cur = g1
        if cur < x1:
            segs.append((cur, x1))
        for si, (s0, s1) in enumerate(segs):
            if s1 - s0 < 0.12:
                continue
            objs.append(box(prefix + f"_rail{si}_{side}", (s0, 0.27, zc + side - 0.055, s1, 0.42, zc + side + 0.055), steel, bevel=0.015))
            # قاعدة القضيب
            objs.append(box(prefix + f"_railf{si}_{side}", (s0, 0.27, zc + side - 0.11, s1, 0.32, zc + side + 0.11), steel, bevel=0.01))
    return objs


# ============================================================
# build_scene — يبني المناطق الأربع
# ============================================================
def build_scene(plan, cards_dir, cam, target, rig):
    state = {"zones": {"A": [], "B": [], "C": [], "D": []}, "wheels": [], "locoB": None, "trainC": None, "trainR": None, "lamps": []}

    def Z(zone, obj):
        state["zones"][zone].append(obj)
        return obj

    # ---------- Zone A: الممر المظلم ----------
    rock_dark = mat("rock_dark", "#3b2c3c", rough=0.9, bump=6, bump_strength=0.5)
    rock_red = mat("rock_red", "#8e3b2c", rough=0.9, bump=5, bump_strength=0.5)
    Z("A", box("A_floor", (-9, -0.02, 0.4, 9, 0.12, 6.0), rock_dark))
    Z("A", box("A_wall_front", (-9, 0, 1.2, 9, 6.0, 1.7), rock_dark))
    Z("A", box("A_wall_back", (-9, 0, 4.9, 9, 6.0, 5.4), rock_dark))
    # قبو مقوّس بقطع مائلة
    for i, ax in enumerate(range(-8, 9, 2)):
        Z("A", box(f"A_archL{i}", (ax, 5.6, 1.2, ax + 1.2, 6.4, 2.6), rock_red, rot_y=0.32))
        Z("A", box(f"A_archR{i}", (ax, 5.6, 3.2, ax + 1.2, 6.4, 4.9), rock_red, rot_y=-0.32))
    for o in add_track("A_track", -9, 9, 3.15, gaps=[(-1.1, -0.6)]):
        Z("A", o)
    # نشارة الخشب/المعدن عند الفجوة
    chips = mat("chips", "#c9a06a", rough=0.9)
    for i in range(10):
        cx = -1.15 + RNG.random() * 0.75
        cz = 2.45 + RNG.random() * 1.35
        Z("A", box(f"A_chip{i}", (cx, 0.28, cz, cx + 0.09, 0.36 + RNG.random() * 0.07, cz + 0.09), chips, bevel=0.01))
    # عمود الـ39 قدماً + لوحة
    Z("A", box("A_post", (1.45, 0, 4.1, 1.75, 2.1, 4.4), wood_post := mat("wood_post", "#6b4a2e", rough=0.8)))
    Z("A", box("A_signboard", (1.32, 1.62, 3.82, 1.88, 2.32, 4.12), mat("sign_gold", "#d8a24a", rough=0.5)))
    # مصباح الممر
    lamp_m = emissive("A_lampglow", "#ffbf7a", 24.0)
    Z("A", cyl("A_lamp", (-2.2, 3.4, 3.15), 0.22, 0.3, lamp_m, axis="Y", verts=16))
    Z("A", box("A_lamparm", (-2.2, 3.4, 3.15, -2.2 + 0.06, 4.6, 3.21), rock_dark))
    state["lamps"].append(lamp_m)

    # ---------- Zone B: فوهة النفق + القاطرة 7 ----------
    Z("B", box("B_floor", (-14, -0.02, 148.5, 14, 0.12, 157), rock_dark))
    for o in add_track("B_track", -10, 12, 153.0):
        Z("B", o)
    # إطار الفوهة
    Z("B", box("B_archL", (-4.0, 0, 149.0, -1.6, 8.0, 150.6), rock_red))
    Z("B", box("B_archR", (7.2, 0, 149.0, 10.0, 8.0, 150.6), rock_red))
    Z("B", box("B_archT", (-1.6, 6.3, 149.0, 7.2, 8.0, 150.6), rock_red))
    # صخور جانبية
    Z("B", box("B_rock1", (10.5, 0, 148, 16, 5.5, 156), rock_dark))
    Z("B", box("B_rock2", (-16, 0, 148, -8, 4.2, 156), rock_dark))
    locoB = add_locomotive("B_loco7", 8.2, 153.0, None, heading=1)
    for o in locoB["objs"]:
        Z("B", o)
    for w in locoB["wheels"]:
        Z("B", w)
    state["locoB"] = locoB

    # ---------- Zone C: الكanyon + الجسر + قطاران ----------
    Z("C", box("C_river", (-8, -2.05, 280, 8, -2.0, 320), mat("water", "#2d6a86", rough=0.14, metal=0.1)))
    strata_cols = ["#b5482e", "#9c3b24", "#c4674a", "#8e3b2c"]
    for bi, (bx0, bz0, bx1, bz1, hy) in enumerate([
        (-40, 270, -6.5, 297.5, 26), (-40, 302.5, -6.5, 330, 26),
        (6.5, 270, 40, 297.5, 26), (6.5, 302.5, 40, 330, 26),
    ]):
        for layer in range(4):
            y0 = -2 + layer * (hy + 2) / 4
            y1 = -2 + (layer + 1) * (hy + 2) / 4
            Z("C", box(f"C_mesa{bi}_{layer}", (bx0 + layer * 0.7, y0, bz0 + layer * 0.4, bx1 - layer * 0.7, y1, bz1 - layer * 0.4),
                       mat(f"strata{bi}_{layer}", strata_cols[(bi + layer) % 4], rough=0.92, bump=4, bump_strength=0.55), bevel=0.12))
    # الجسر الخشبي: أعمدة + سطح + سكة
    wood = mat("C_wood", "#5c3d28", rough=0.85, bump=16)
    for i, px in enumerate(range(-8, 9, 2)):
        Z("C", box(f"C_pier{i}", (px, -2, 298.2, px + 0.5, 2.35, 301.8), wood, bevel=0.03))
        Z("C", box(f"C_pierx{i}a", (px - 0.35, 0.4, 298.2, px + 0.85, 0.62, 301.8), wood, rot_y=0.6))
        Z("C", box(f"C_pierx{i}b", (px - 0.35, 1.35, 298.2, px + 0.85, 1.57, 301.8), wood, rot_y=-0.6))
    Z("C", box("C_deck", (-9, 2.35, 297.8, 9, 2.75, 302.2), wood, bevel=0.05))
    for o in add_track("C_track", -9, 9, 300.0, ballast=False):
        o.location[2] += 2.4  # ارفع السكة فوق السطح
        Z("C", o)
    # صبار على الحواف
    cactus = mat("cactus", "#4c7a4e", rough=0.8)
    for i, (cx, cz) in enumerate([(-10.5, 288), (-11.5, 311), (11, 285), (12, 314), (-9.5, 276)]):
        Z("C", cyl(f"C_cac{i}", (cx, 1.6, cz), 0.34, 3.2, cactus, axis="Y", verts=12))
        Z("C", cyl(f"C_cacarm{i}", (cx + 0.55, 2.1, cz), 0.2, 1.1, cactus, axis="X", verts=10))
    # قطاران يتسابقان
    trainC = add_locomotive("C_trainA", -1.5, 300.0, None, heading=1)
    for o in trainC["objs"]:
        o.location[2] += 2.4
        Z("C", o)
    for w in trainC["wheels"]:
        w.location[2] += 2.4
        Z("C", w)
    Z("C", box("C_carA1", (-8.2, 3.0, 298.9, -4.6, 6.4, 301.1), mat("carA", "#7a4a2c", rough=0.7), bevel=0.08))
    Z("C", box("C_carA2", (-11.6, 3.0, 298.9, -8.2, 6.4, 301.1), mat("carB", "#5c3d5c", rough=0.7), bevel=0.08))
    state["trainC"] = {"root": trainC, "cars": ["C_carA1", "C_carA2"]}
    trainR = add_locomotive("C_trainB", 8.8, 300.0, None, heading=-1)
    for o in trainR["objs"]:
        o.location[2] += 2.4
        Z("C", o)
    for w in trainR["wheels"]:
        w.location[2] += 2.4
        Z("C", w)
    Z("C", box("C_carB1", (9.6, 3.0, 298.9, 13.0, 6.4, 301.1), mat("carC", "#3c5c6c", rough=0.7), bevel=0.08))
    state["trainR"] = {"root": trainR, "cars": ["C_carB1"]}

    # ---------- Zone D: الحافة + الصحراء + لافتة النهاية ----------
    Z("D", box("D_ledge", (-10, -0.02, 446, 8, 0.12, 454), rock_dark))
    Z("D", box("D_rimrock", (-9, 0, 450.5, 7, 3.4, 452.2), rock_red))
    Z("D", box("D_rimrock2", (-9.6, 0, 452.2, -5.5, 2.1, 453.6), rock_dark))
    sand = mat("sand", "#d8a25e", rough=0.95, bump=8, bump_strength=0.4)
    sand2 = mat("sand2", "#c88e4e", rough=0.95, bump=8, bump_strength=0.4)
    for i, (dx, dz, s) in enumerate([(-14, 438, 7), (-2, 434, 9), (12, 437, 8), (24, 433, 10), (-26, 432, 9), (4, 430, 12)]):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=10, location=pb(dx, -1.2, dz))
        d = bpy.context.active_object
        d.name = f"D_dune{i}"
        d.scale = (s, s * 0.9, s * 0.32)
        d.data.materials.append(sand if i % 2 else sand2)
        Z("D", d)
    # أعمدة التلغراف
    for i, pz in enumerate([445.5, 441.5, 437.5]):
        Z("D", box(f"D_pole{i}", (-3.4, 0, pz, -3.15, 4.6, pz + 0.25), wood_post, bevel=0.02))
        Z("D", box(f"D_polearm{i}", (-4.15, 4.15, pz - 0.06, -2.4, 4.32, pz + 0.31), wood_post, bevel=0.02))
    # لافتة خط النهاية
    Z("D", box("D_postL", (-3.4, 0, 444.5, -3.1, 5.2, 444.9), wood_post))
    Z("D", box("D_postR", (3.1, 0, 444.5, 3.4, 5.2, 444.9), wood_post))
    Z("D", box("D_banner", (-3.25, 3.2, 444.55, 3.25, 5.0, 444.85), mat("banner", "#e8c45a", rough=0.6)))
    Z("D", box("D_bannerink", (-2.9, 3.55, 444.52, 2.9, 4.65, 444.88), mat("bannerink", "#211d27", rough=0.7)))
    return state


# ============================================================
# update_frame — إظهار المنطقة النشطة + تدوير العجلات + الحركة
# ============================================================
def update_frame(fr, scene, cam, target, state):
    # أي منطقة نشطة؟
    if fr < 80:
        active = "A"
    elif fr < 112:
        active = "B"
    elif fr < 254:
        active = "C"
    else:
        active = "D"
    for zone, objs in state["zones"].items():
        vis = zone == active
        for o in objs:
            try:
                o.hide_render = not vis
            except Exception:
                pass

    # Zone B: وصول القاطرة 7 (f80–112)
    loco = state.get("locoB")
    if loco and active == "B":
        u = min(1.0, max(0.0, (fr - 80) / 30.0))
        ease = 1 - (1 - u) ** 2
        dx = (1 - ease) * 13.0  # من x=+13 إلى موضعها
        for o in loco["objs"] + loco["wheels"]:
            o.location[0] -= 0  # الموضع الأساسي مضبوط؛ نزيح النسخة كاملة
        # نزوح عبر كل الأجسام (بسيطة: نحسب مرة واحدة)
        if "shift" not in loco:
            loco["shift"] = 0.0
        delta = dx - loco["shift"]
        loco["shift"] = dx
        for o in loco["objs"] + loco["wheels"]:
            o.location[0] += delta
        for w in loco["wheels"]:
            w.rotation_euler[1] = -dx / 0.62

    # Zone C: القطاران يتحركان ببطء (التسابق)
    if active == "C":
        u = (fr - 112) / 140.0
        ta = state.get("trainC")
        tb = state.get("trainR")
        if ta:
            dx = u * 3.4
            for name in ta["cars"]:
                o = scene.objects.get(name)
                if o:
                    o.location[0] += dx - ta.get("last", 0.0)
            for o in ta["root"]["objs"] + ta["root"]["wheels"]:
                o.location[0] += dx - ta.get("last", 0.0)
            for w in ta["root"]["wheels"]:
                w.rotation_euler[1] = -dx / 0.62
            ta["last"] = dx
        if tb:
            dx = -u * 2.6
            for name in tb["cars"]:
                o = scene.objects.get(name)
                if o:
                    o.location[0] += dx - tb.get("last", 0.0)
            for o in tb["root"]["objs"] + tb["root"]["wheels"]:
                o.location[0] += dx - tb.get("last", 0.0)
            for w in tb["root"]["wheels"]:
                w.rotation_euler[1] = -dx / 0.62
            tb["last"] = dx

    # وميض المصباح
    for lm in state.get("lamps", []):
        try:
            b = lm.node_tree.nodes.get("Principled BSDF")
            b.inputs["Emission Strength"].default_value = 22.0 + 5.0 * math.sin(fr * 0.9) + 2.0 * math.sin(fr * 2.7)
        except Exception:
            pass
