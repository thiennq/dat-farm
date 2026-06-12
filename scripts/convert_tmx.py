import os
import xml.etree.ElementTree as ET
import json

def convert_tmx(tmx_path, output_json_path):
    print(f"Reading TMX file: {tmx_path}")
    tree = ET.parse(tmx_path)
    root = tree.getroot()
    
    # Get map properties
    width = int(root.attrib['width'])
    height = int(root.attrib['height'])
    tilewidth = int(root.attrib['tilewidth'])
    tileheight = int(root.attrib['tileheight'])
    
    # We will build the Tiled JSON format dict
    map_data = {
        "compressionlevel": -1,
        "height": height,
        "width": width,
        "tilewidth": tilewidth,
        "tileheight": tileheight,
        "infinite": False,
        "orientation": "orthogonal",
        "renderorder": "right-down",
        "tiledversion": root.attrib.get('tiledversion', '1.8.6'),
        "type": "map",
        "version": root.attrib.get('version', '1.8'),
        "nextlayerid": int(root.attrib.get('nextlayerid', '1')),
        "nextobjectid": int(root.attrib.get('nextobjectid', '1')),
        "tilesets": [],
        "layers": []
    }
    
    # Parse tilesets
    for tileset_elem in root.findall('tileset'):
        firstgid = int(tileset_elem.attrib['firstgid'])
        source = tileset_elem.attrib['source']
        
        # Load the external .tsx file
        tsx_relative_path = os.path.join(os.path.dirname(tmx_path), source)
        tsx_path = os.path.abspath(tsx_relative_path)
        
        if not os.path.exists(tsx_path):
            print(f"Warning: TSX file not found: {tsx_path}")
            continue
            
        tsx_tree = ET.parse(tsx_path)
        tsx_root = tsx_tree.getroot()
        
        name = tsx_root.attrib['name']
        ts_tilewidth = int(tsx_root.attrib['tilewidth'])
        ts_tileheight = int(tsx_root.attrib['tileheight'])
        tilecount = int(tsx_root.attrib.get('tilecount', '0'))
        columns = int(tsx_root.attrib.get('columns', '0'))
        
        tileset_dict = {
            "firstgid": firstgid,
            "name": name,
            "tilewidth": ts_tilewidth,
            "tileheight": ts_tileheight,
            "tilecount": tilecount,
            "columns": columns
        }
        
        image_elem = tsx_root.find('image')
        if image_elem is not None:
            # For standard spreadsheet tilesets
            img_source = image_elem.attrib['source']
            # We want to normalize the path. TMX relative path: ../../graphics/environment/Grass.png
            # In our public folder structure, it is: public/assets/environment/Grass.png
            # Let's map it.
            clean_img_source = img_source.replace('../../graphics/', 'assets/')
            tileset_dict["image"] = clean_img_source
            tileset_dict["imagewidth"] = int(image_elem.attrib['width'])
            tileset_dict["imageheight"] = int(image_elem.attrib['height'])
        else:
            # For image collection tilesets (like Objects)
            tiles_list = []
            for tile_elem in tsx_root.findall('tile'):
                tile_id = int(tile_elem.attrib['id'])
                t_image_elem = tile_elem.find('image')
                t_img_source = t_image_elem.attrib['source'].replace('../../graphics/', 'assets/')
                tiles_list.append({
                    "id": tile_id,
                    "image": t_img_source,
                    "imagewidth": int(t_image_elem.attrib['width']),
                    "imageheight": int(t_image_elem.attrib['height'])
                })
            tileset_dict["tiles"] = tiles_list
            
        map_data["tilesets"].append(tileset_dict)
        
    # Parse layers (tilelayers and objectgroups)
    for elem in root:
        if elem.tag == 'layer':
            layer_id = int(elem.attrib['id'])
            name = elem.attrib['name']
            l_width = int(elem.attrib.get('width', width))
            l_height = int(elem.attrib.get('height', height))
            visible = int(elem.attrib.get('visible', '1')) == 1
            opacity = float(elem.attrib.get('opacity', '1.0'))
            
            data_elem = elem.find('data')
            encoding = data_elem.attrib.get('encoding')
            
            if encoding == 'csv':
                # Parse CSV data
                data_text = data_elem.text.strip()
                data_list = [int(x) for x in data_text.replace('\n', '').split(',') if x.strip()]
            else:
                raise ValueError(f"Unsupported encoding: {encoding} for layer {name}")
                
            map_data["layers"].append({
                "data": data_list,
                "height": l_height,
                "width": l_width,
                "id": layer_id,
                "name": name,
                "opacity": opacity,
                "type": "tilelayer",
                "visible": visible,
                "x": 0,
                "y": 0
            })
            
        elif elem.tag == 'objectgroup':
            layer_id = int(elem.attrib['id'])
            name = elem.attrib['name']
            visible = int(elem.attrib.get('visible', '1')) == 1
            opacity = float(elem.attrib.get('opacity', '1.0'))
            
            objects_list = []
            for obj_elem in elem.findall('object'):
                obj_id = int(obj_elem.attrib['id'])
                obj_name = obj_elem.attrib.get('name', '')
                obj_type = obj_elem.attrib.get('type', obj_elem.attrib.get('class', ''))
                x = float(obj_elem.attrib['x'])
                y = float(obj_elem.attrib['y'])
                obj_w = float(obj_elem.attrib.get('width', '0'))
                obj_h = float(obj_elem.attrib.get('height', '0'))
                gid = obj_elem.attrib.get('gid')
                
                obj_dict = {
                    "id": obj_id,
                    "name": obj_name,
                    "type": obj_type,
                    "x": x,
                    "y": y,
                    "width": obj_w,
                    "height": obj_h,
                    "visible": True
                }
                if gid is not None:
                    obj_dict["gid"] = int(gid)
                    
                # Check for properties
                properties_elem = obj_elem.find('properties')
                if properties_elem is not None:
                    obj_dict["properties"] = {}
                    for prop_elem in properties_elem.findall('property'):
                        p_name = prop_elem.attrib['name']
                        p_val = prop_elem.attrib.get('value')
                        if p_val is None:
                            p_val = prop_elem.text
                        obj_dict["properties"][p_name] = p_val
                        
                objects_list.append(obj_dict)
                
            map_data["layers"].append({
                "draworder": "topdown",
                "id": layer_id,
                "name": name,
                "objects": objects_list,
                "opacity": opacity,
                "type": "objectgroup",
                "visible": visible,
                "x": 0,
                "y": 0
            })
            
    # Write output JSON
    os.makedirs(os.path.dirname(output_json_path), exist_ok=True)
    with open(output_json_path, 'w', encoding='utf-8') as f:
        json.dump(map_data, f, indent=2, ensure_ascii=False)
    print(f"Successfully converted to {output_json_path}")

if __name__ == '__main__':
    convert_tmx(
        '/Users/thiennq/workspace/personal/farm/public/assets/data/map.tmx',
        '/Users/thiennq/workspace/personal/farm/public/assets/data/map.json'
    )
