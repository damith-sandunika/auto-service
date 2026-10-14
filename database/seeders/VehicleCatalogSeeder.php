<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\VehicleMake;
use App\Models\VehicleModel;

class VehicleCatalogSeeder extends Seeder
{
    public function run()
    {
        $catalog = [
            'Toyota' => [
                ['name' => 'Prius', 'type' => 'Hatchback / Hybrid'],
                ['name' => 'Corolla', 'type' => 'Sedan'],
                ['name' => 'Camry', 'type' => 'Sedan'],
                ['name' => 'Aqua', 'type' => 'Hatchback / Hybrid'],
                ['name' => 'Vitz', 'type' => 'Hatchback'],
                ['name' => 'Yaris', 'type' => 'Sedan / Hatchback'],
                ['name' => 'Hilux', 'type' => 'Pickup / 4x4'],
                ['name' => 'Land Cruiser', 'type' => 'SUV'],
                ['name' => 'Land Cruiser Prado', 'type' => 'SUV'],
                ['name' => 'RAV4', 'type' => 'SUV'],
                ['name' => 'HiAce', 'type' => 'Van'],
                ['name' => 'C-HR', 'type' => 'Crossover / SUV'],
                ['name' => 'Axio', 'type' => 'Sedan / Hybrid'],
                ['name' => 'Allion', 'type' => 'Sedan'],
                ['name' => 'Premio', 'type' => 'Sedan'],
                ['name' => 'Harrier', 'type' => 'Luxury SUV'],
                ['name' => 'Rush', 'type' => 'Compact SUV'],
                ['name' => 'Raize', 'type' => 'Compact SUV'],
            ],
            'Honda' => [
                ['name' => 'Civic', 'type' => 'Sedan'],
                ['name' => 'Accord', 'type' => 'Sedan'],
                ['name' => 'Fit / Jazz', 'type' => 'Hatchback / Hybrid'],
                ['name' => 'Vezel / HR-V', 'type' => 'Crossover / SUV'],
                ['name' => 'CR-V', 'type' => 'SUV'],
                ['name' => 'Grace', 'type' => 'Sedan / Hybrid'],
                ['name' => 'Insight', 'type' => 'Sedan / Hybrid'],
                ['name' => 'City', 'type' => 'Sedan'],
                ['name' => 'Shuttle', 'type' => 'Station Wagon / Hybrid'],
            ],
            'Nissan' => [
                ['name' => 'Sunny', 'type' => 'Sedan'],
                ['name' => 'X-Trail', 'type' => 'SUV / Hybrid'],
                ['name' => 'Leaf', 'type' => 'Electric Hatchback'],
                ['name' => 'Navara', 'type' => 'Pickup'],
                ['name' => 'March / Micra', 'type' => 'Hatchback'],
                ['name' => 'Note / e-Power', 'type' => 'Hatchback / Hybrid'],
                ['name' => 'Caravan / Urvan', 'type' => 'Van'],
                ['name' => 'Tiida / Latio', 'type' => 'Sedan / Hatchback'],
                ['name' => 'Patrol', 'type' => 'SUV / 4x4'],
                ['name' => 'Dayz', 'type' => 'Kei Car'],
            ],
            'Suzuki' => [
                ['name' => 'Alto', 'type' => 'Hatchback'],
                ['name' => 'Wagon R', 'type' => 'Hatchback / Hybrid'],
                ['name' => 'Spacia', 'type' => 'Mini MPV / Hybrid'],
                ['name' => 'Hustler', 'type' => 'Mini SUV / Crossover'],
                ['name' => 'Swift', 'type' => 'Hatchback'],
                ['name' => 'Baleno', 'type' => 'Hatchback'],
                ['name' => 'Vitara / Grand Vitara', 'type' => 'SUV'],
                ['name' => 'Jimny', 'type' => 'Compact 4x4'],
                ['name' => 'Every', 'type' => 'Micro Van'],
                ['name' => 'Celerio', 'type' => 'Hatchback'],
                ['name' => 'Dzire', 'type' => 'Sedan'],
                ['name' => 'S-Presso', 'type' => 'Mini Crossover'],
            ],
            'Mitsubishi' => [
                ['name' => 'Montero / Pajero', 'type' => 'SUV / 4x4'],
                ['name' => 'Montero Sport', 'type' => 'SUV'],
                ['name' => 'Outlander PHEV', 'type' => 'Plug-in Hybrid SUV'],
                ['name' => 'L200 / Triton', 'type' => 'Pickup'],
                ['name' => 'Lancer', 'type' => 'Sedan'],
                ['name' => 'Mirage', 'type' => 'Hatchback'],
                ['name' => 'Eclipse Cross', 'type' => 'Crossover SUV'],
                ['name' => 'Xpander', 'type' => 'MPV / 7-Seater'],
                ['name' => 'Delica', 'type' => 'Van / 4WD'],
            ],
            'Mazda' => [
                ['name' => 'Mazda 2 / Demio', 'type' => 'Hatchback'],
                ['name' => 'Mazda 3 / Axela', 'type' => 'Sedan / Hatchback'],
                ['name' => 'Mazda 6 / Atenza', 'type' => 'Sedan / Wagon'],
                ['name' => 'CX-3', 'type' => 'Compact Crossover'],
                ['name' => 'CX-5', 'type' => 'SUV'],
                ['name' => 'CX-30', 'type' => 'Crossover'],
                ['name' => 'CX-8', 'type' => 'SUV / 7-Seater'],
                ['name' => 'CX-9', 'type' => 'Full-size SUV'],
                ['name' => 'BT-50', 'type' => 'Pickup'],
                ['name' => 'Flair', 'type' => 'Kei Car'],
            ],
            'Hyundai' => [
                ['name' => 'Tucson', 'type' => 'SUV'],
                ['name' => 'Santa Fe', 'type' => 'SUV'],
                ['name' => 'Elantra', 'type' => 'Sedan'],
                ['name' => 'Sonata', 'type' => 'Sedan'],
                ['name' => 'Grand i10', 'type' => 'Hatchback'],
                ['name' => 'i20', 'type' => 'Hatchback'],
                ['name' => 'Creta', 'type' => 'Compact SUV'],
                ['name' => 'Kona Electric', 'type' => 'EV Crossover'],
                ['name' => 'Ioniq 5', 'type' => 'EV SUV'],
                ['name' => 'H1 / Starex', 'type' => 'Van'],
            ],
            'Kia' => [
                ['name' => 'Sportage', 'type' => 'SUV'],
                ['name' => 'Sorento', 'type' => 'SUV'],
                ['name' => 'Picanto', 'type' => 'Hatchback'],
                ['name' => 'Rio', 'type' => 'Hatchback / Sedan'],
                ['name' => 'Cerato', 'type' => 'Sedan'],
                ['name' => 'Seltos', 'type' => 'Compact SUV'],
                ['name' => 'Carnival', 'type' => 'Luxury MPV'],
                ['name' => 'EV6', 'type' => 'EV Crossover'],
            ],
            'Mercedes-Benz' => [
                ['name' => 'C-Class (C180 / C200 / C300)', 'type' => 'Luxury Sedan'],
                ['name' => 'E-Class (E200 / E250 / E300)', 'type' => 'Executive Sedan'],
                ['name' => 'S-Class (S350 / S450 / S500)', 'type' => 'Luxury Flagship'],
                ['name' => 'A-Class', 'type' => 'Hatchback / Sedan'],
                ['name' => 'CLA-Class', 'type' => 'Coupe / Sedan'],
                ['name' => 'GLA-Class', 'type' => 'Compact Luxury SUV'],
                ['name' => 'GLC-Class', 'type' => 'Luxury SUV'],
                ['name' => 'GLE-Class', 'type' => 'Mid-size Luxury SUV'],
                ['name' => 'G-Class (G63 AMG)', 'type' => 'Luxury 4x4'],
            ],
            'BMW' => [
                ['name' => '3 Series (318i / 320i / 330e)', 'type' => 'Sport Sedan'],
                ['name' => '5 Series (520d / 530e)', 'type' => 'Executive Sedan'],
                ['name' => '7 Series', 'type' => 'Luxury Flagship'],
                ['name' => '1 Series', 'type' => 'Hatchback'],
                ['name' => '2 Series Gran Coupe', 'type' => 'Coupe / Sedan'],
                ['name' => 'X1', 'type' => 'Compact SUV'],
                ['name' => 'X3', 'type' => 'Luxury SUV'],
                ['name' => 'X5', 'type' => 'Mid-size Luxury SUV'],
                ['name' => 'iX3 / i4', 'type' => 'Electric'],
            ],
            'Audi' => [
                ['name' => 'A3', 'type' => 'Sedan'],
                ['name' => 'A4', 'type' => 'Sedan'],
                ['name' => 'A6', 'type' => 'Executive Sedan'],
                ['name' => 'Q2', 'type' => 'Compact SUV'],
                ['name' => 'Q3', 'type' => 'SUV'],
                ['name' => 'Q5', 'type' => 'SUV'],
                ['name' => 'Q7', 'type' => 'Full-size SUV'],
                ['name' => 'e-tron', 'type' => 'Electric SUV'],
            ],
            'Daihatsu' => [
                ['name' => 'Mira / Mira e:S', 'type' => 'Hatchback / Kei Car'],
                ['name' => 'Cast', 'type' => 'Kei Car'],
                ['name' => 'Tanto', 'type' => 'Mini MPV'],
                ['name' => 'Terios', 'type' => 'Compact SUV'],
                ['name' => 'Hijet', 'type' => 'Micro Truck / Van'],
                ['name' => 'Rocky', 'type' => 'Compact SUV'],
            ],
            'Isuzu' => [
                ['name' => 'D-Max', 'type' => 'Pickup / 4x4'],
                ['name' => 'MU-X', 'type' => 'SUV'],
                ['name' => 'Elf', 'type' => 'Light Duty Truck'],
                ['name' => 'Forward', 'type' => 'Medium Duty Truck'],
            ],
            'Tata' => [
                ['name' => 'Nano', 'type' => 'Micro Hatchback'],
                ['name' => 'Tiago', 'type' => 'Hatchback'],
                ['name' => 'Nexon', 'type' => 'Compact SUV'],
                ['name' => 'Harrier', 'type' => 'SUV'],
                ['name' => 'Ace (Dimo Batta)', 'type' => 'Commercial Mini Truck'],
                ['name' => 'Xenon', 'type' => 'Pickup'],
            ],
            'Mahindra' => [
                ['name' => 'Scorpio', 'type' => 'SUV'],
                ['name' => 'Bolero / Bolero Maxi Truck', 'type' => 'Pickup / Utility'],
                ['name' => 'XUV500 / XUV700', 'type' => 'SUV'],
                ['name' => 'Thar', 'type' => '4x4 Off-roader'],
                ['name' => 'KUV100', 'type' => 'Mini SUV'],
            ],
            'Bajaj' => [
                ['name' => 'RE Auto (Three Wheeler)', 'type' => 'Three Wheeler / Tuk Tuk'],
                ['name' => 'Maxima Cargo / Passenger', 'type' => 'Commercial Three Wheeler'],
                ['name' => 'Pulsar (150/180/200/220)', 'type' => 'Motorcycle'],
                ['name' => 'Discover', 'type' => 'Motorcycle'],
                ['name' => 'Platina', 'type' => 'Motorcycle'],
                ['name' => 'Qute', 'type' => 'Quadricycle'],
            ],
            'TVS' => [
                ['name' => 'King (Three Wheeler)', 'type' => 'Three Wheeler / Tuk Tuk'],
                ['name' => 'Apache RTR', 'type' => 'Motorcycle'],
                ['name' => 'Metro', 'type' => 'Motorcycle'],
                ['name' => 'NTORQ 125', 'type' => 'Scooter'],
                ['name' => 'Jupiter', 'type' => 'Scooter'],
            ],
            'Yamaha' => [
                ['name' => 'FZ / FZ-S', 'type' => 'Motorcycle'],
                ['name' => 'RayZR', 'type' => 'Scooter'],
                ['name' => 'MT-15', 'type' => 'Motorcycle'],
                ['name' => 'YZF-R15', 'type' => 'Sports Motorcycle'],
            ],
            'Land Rover' => [
                ['name' => 'Range Rover', 'type' => 'Flagship Luxury SUV'],
                ['name' => 'Range Rover Sport', 'type' => 'Luxury SUV'],
                ['name' => 'Range Rover Evoque', 'type' => 'Compact Luxury SUV'],
                ['name' => 'Range Rover Velar', 'type' => 'Luxury SUV'],
                ['name' => 'Defender (90 / 110)', 'type' => 'Luxury Off-Road 4x4'],
                ['name' => 'Discovery / Discovery Sport', 'type' => 'SUV'],
            ],
            'Peugeot' => [
                ['name' => '208', 'type' => 'Hatchback'],
                ['name' => '2008', 'type' => 'Compact SUV'],
                ['name' => '3008', 'type' => 'SUV'],
                ['name' => '5008', 'type' => '7-Seater SUV'],
                ['name' => '508', 'type' => 'Fastback / Sedan'],
            ],
            'Ford' => [
                ['name' => 'Ranger', 'type' => 'Pickup / 4x4'],
                ['name' => 'Everest', 'type' => 'SUV'],
                ['name' => 'EcoSport', 'type' => 'Compact SUV'],
                ['name' => 'Mustang', 'type' => 'Sports Car'],
            ],
            'BYD' => [
                ['name' => 'Atto 3', 'type' => 'Electric SUV'],
                ['name' => 'Dolphin', 'type' => 'Electric Hatchback'],
                ['name' => 'Seal', 'type' => 'Electric Sedan'],
                ['name' => 'Song Plus', 'type' => 'Hybrid SUV'],
            ],
        ];

        foreach ($catalog as $makeName => $models) {
            $make = VehicleMake::firstOrCreate(['name' => $makeName]);

            foreach ($models as $modelData) {
                VehicleModel::firstOrCreate(
                    [
                        'make_id' => $make->id,
                        'name' => $modelData['name'],
                    ],
                    [
                        'type' => $modelData['type'],
                    ]
                );
            }
        }
    }
}
