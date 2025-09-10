import os
import json
import glob

def generate_photo_manifest(base_path):
    """
    Genera un manifest de todas las fotos en la estructura de carpetas.
    
    Args:
        base_path (str): Ruta a la carpeta base 'fotos'
    
    Returns:
        dict: Estructura con información de todas las fotos
    """
    manifest = {}
    
    # Encontrar todas las carpetas de día
    day_folders = glob.glob(os.path.join(base_path, 'dia*'))
    
    for day_path in day_folders:
        day_name = os.path.basename(day_path)
        manifest[day_name] = {}
        
        # Encontrar todas las carpetas de actividad
        activity_folders = glob.glob(os.path.join(day_path, '*'))
        
        for activity_path in activity_folders:
            activity_name = os.path.basename(activity_path)
            manifest[day_name][activity_name] = []
            
            # Encontrar todas las imágenes
            image_extensions = ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.webp']
            images = []
            
            for extension in image_extensions:
                images.extend(glob.glob(os.path.join(activity_path, extension)))
            
            # Ordenar alfabéticamente
            images.sort()
            
            # Agregar al manifest con nombres secuenciales
            for i, image_path in enumerate(images, 1):
                original_name = os.path.basename(image_path)
                sequential_name = f"{i:03d}{os.path.splitext(original_name)[1]}"
                
                manifest[day_name][activity_name].append({
                    "original": original_name,
                    "sequential": sequential_name
                })
    
    return manifest

def main():
    # Ruta a tu carpeta de fotos (ajusta según sea necesario)
    fotos_path = "./fotos"
    
    # Verificar si existe la carpeta
    if not os.path.exists(fotos_path):
        print(f"Error: La carpeta '{fotos_path}' no existe.")
        return
    
    # Generar el manifest
    print("Generando manifest de fotos...")
    manifest = generate_photo_manifest(fotos_path)
    
    # Crear la carpeta data si no existe
    data_dir = "./data"
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
    
    # Guardar como archivo JS
    output_path = os.path.join(data_dir, "photo-manifest.js")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("window.photoManifest = ")
        f.write(json.dumps(manifest, indent=2, ensure_ascii=False))
        f.write(";")
    
    print(f"Manifest generado exitosamente en {output_path}")
    print(f"Total de días encontrados: {len(manifest)}")
    
    # Mostrar estadísticas
    total_activities = 0
    total_photos = 0
    
    for day, activities in manifest.items():
        total_activities += len(activities)
        for activity, photos in activities.items():
            total_photos += len(photos)
    
    print(f"Total de actividades: {total_activities}")
    print(f"Total de fotos: {total_photos}")

if __name__ == "__main__":
    main()