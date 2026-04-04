-- Routes import from Чумачекно Sud Marsrut 2025.xlsx
-- Agent: Алексей Агент | Period: April-May 2026

-- 2026-04-06 (Пн, неделя 1): 3 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('07964dff-ee2d-4524-9b13-76dfafcd7dcd', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-06', 'Маршрут Юг 2026-04-06', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('cf435dbb-08a6-46b7-85f2-64eddf2caeee', '07964dff-ee2d-4524-9b13-76dfafcd7dcd', 'SC Unistar SRL', 'or.Cahul str.Alexei Mateevici nr. 12/V, inc.4', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('44cc9cf1-9fe0-429f-a7f1-9e7930202456', '07964dff-ee2d-4524-9b13-76dfafcd7dcd', 'Vasigrover SRL', 'or.Cahul str.Republicii 16/16', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('337a63df-4b69-4fd0-8090-c385b1b41f89', '07964dff-ee2d-4524-9b13-76dfafcd7dcd', 'SC Unistar SRL', 'or.Cahul str.F.Seliviorstov 9E', 3);

-- 2026-04-07 (Вт, неделя 1): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('799a08ac-9bc5-4a31-aae7-45d0038892fd', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-07', 'Маршрут Юг 2026-04-07', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('5bba4531-1ad6-4328-a158-901a843968a8', '799a08ac-9bc5-4a31-aae7-45d0038892fd', 'Calciscova & S SRL', 'or.Ceadir Lunga str.M Lomonosov 2', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('6d1ec55f-14aa-4812-a77e-35ab7df442a5', '799a08ac-9bc5-4a31-aae7-45d0038892fd', 'Goreacichin Alexei Patent AB224538', 'or.Cahul str.31 August 13g, tr.37', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('54463079-88d7-4276-b6b0-b7736337408e', '799a08ac-9bc5-4a31-aae7-45d0038892fd', 'Urum Ivan II', 's.Congaz str.Lenin 51A', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('9aa0ff82-0306-415d-956f-b99bd26a1e16', '799a08ac-9bc5-4a31-aae7-45d0038892fd', 'Altahdji SRL', 'or.Cahul str.M.Eminescu 24 a', 4);

-- 2026-04-08 (Ср, неделя 2): 6 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('52d60242-f7d7-466e-900f-8e04effc5f68', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-08', 'Маршрут Юг 2026-04-08', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('7c210f31-1377-4185-81b0-f5834d5f5696', '52d60242-f7d7-466e-900f-8e04effc5f68', 'Capit Maria II', 'or.Leova str.Idependentei 23/18', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('d233073b-b36c-43f0-8d56-d7bf162bfddd', '52d60242-f7d7-466e-900f-8e04effc5f68', 'Cociu Tatiana II', 'or.Leova str.Constantin Pruteanu nr.5', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('ea56fff4-2668-4811-af39-276b236234cd', '52d60242-f7d7-466e-900f-8e04effc5f68', 'Atlanta-Cunev II', 'or. Cantemir  str.Stefan Voda mag. N1', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('4eb468ea-f24e-49c7-803f-23659323bb5d', '52d60242-f7d7-466e-900f-8e04effc5f68', 'Buraga Ala Vasile Patenta AB 217619', 'or. Leova str. Stefan cel Mare 68', 4);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('094df4d3-f164-444b-bce6-01db32702a37', '52d60242-f7d7-466e-900f-8e04effc5f68', 'Lazurum SRL', 'r-nul Leova s.Iargara  str.31 august 23/1', 5);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('844821dc-8108-48a8-ac7d-fbfac1f091d3', '52d60242-f7d7-466e-900f-8e04effc5f68', 'Avid-Com SRL', 'or.Leova str.Stefan cel Mare', 6);

-- 2026-04-09 (Чт, неделя 2): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('b4601f3c-abe2-4406-b208-50bb2135d679', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-09', 'Маршрут Юг 2026-04-09', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('2aca8152-683f-440b-b17a-06608a662963', 'b4601f3c-abe2-4406-b208-50bb2135d679', 'Kusadasi SRL', 'or.Comrat str.Pobeda 48', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('1774eab7-b4ab-4bdd-8ed9-9d6f675d3c62', 'b4601f3c-abe2-4406-b208-50bb2135d679', 'Mavdani-Agro SRL', 'or.Comrat str.Mirnii str-la 20', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('6c7b8acc-07d1-4767-bda8-8ceb5cf502a2', 'b4601f3c-abe2-4406-b208-50bb2135d679', 'Kusadasi SRL', 'or.Comrat str.Dimitrov 20', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('eb9f8db0-584a-4521-9222-4bd21e1a9236', 'b4601f3c-abe2-4406-b208-50bb2135d679', 'Ininih-Grup SRL', 'or.Comrat str.Gavriliuc 15', 4);

-- 2026-04-10 (Пт, неделя 2): 7 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('c9c395ec-128c-43f3-bf99-71220d82aae2', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-10', 'Маршрут Юг 2026-04-10', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('b1929a42-8088-42cc-961a-689a840666b1', 'c9c395ec-128c-43f3-bf99-71220d82aae2', 'Tanov SRL', 'or.Taraclia str.Lenin 173', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('a8a5a03f-7f34-4fb2-a4a8-e0ee10aea114', 'c9c395ec-128c-43f3-bf99-71220d82aae2', 'Stroitehnologia SRL', 'or.Taraclia, str. Lenina 191', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('48ad2da4-aa57-480a-a45a-1e305756484b', 'c9c395ec-128c-43f3-bf99-71220d82aae2', 'Starsina SRL', 'or.Taraclia str.Lenin 141a', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('728e75b0-fd34-4f02-958b-42049c7483cd', 'c9c395ec-128c-43f3-bf99-71220d82aae2', 'Popovici Stepan II', 'or.Vulcanesti str.Nicutova 41', 4);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('6e6859f4-1b99-48a8-bdd0-990c5744b102', 'c9c395ec-128c-43f3-bf99-71220d82aae2', 'Continent Terzi II', 'or.Vulcanesti str.Lenina 110', 5);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('8cee2b4f-3f85-4b9d-9bc1-b3554e0d1979', 'c9c395ec-128c-43f3-bf99-71220d82aae2', 'Prezent-Presenti SRL', 'or.Vulcanesti str. Lenina 86', 6);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('5d7c36ef-f087-4774-919e-8cdc37aa8e12', 'c9c395ec-128c-43f3-bf99-71220d82aae2', 'Max Rudenco II', 'or.Vulcanesti str.Frunze 23', 7);

-- 2026-04-13 (Пн, неделя 2): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('bb657dd6-9c27-48f4-a239-d5a8a6800965', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-13', 'Маршрут Юг 2026-04-13', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('2d2b6dfa-2ffa-4850-b6bd-2a6966aebf81', 'bb657dd6-9c27-48f4-a239-d5a8a6800965', 'SC Unistar SRL', 'or.Cahul str.Alexei Mateevici nr. 12/V, inc.4', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('5ff82594-4cd1-457d-b4a6-46706522864f', 'bb657dd6-9c27-48f4-a239-d5a8a6800965', 'SC Unistar SRL', 'or.Cahul str.F.Seliviorstov 9E', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('bf58847a-c4b2-4cd4-adc2-11fdab0afe40', 'bb657dd6-9c27-48f4-a239-d5a8a6800965', 'Construct Univers SRL', 'or.Cahul str. Fantanilor nr.23/1', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('15ecc853-7bc5-4acb-947c-7936ddd50c42', 'bb657dd6-9c27-48f4-a239-d5a8a6800965', 'Modernus SA', 'or.Cahul str.Stefan cel Mare 52', 4);

-- 2026-04-14 (Вт, неделя 2): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('d3b13b18-1ba8-40ed-b79f-27f556cd458f', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-14', 'Маршрут Юг 2026-04-14', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('503ad1f1-805d-497e-921e-c9bc384f287d', 'd3b13b18-1ba8-40ed-b79f-27f556cd458f', 'Calciscova & S SRL', 'or.Ceadir Lunga str.M Lomonosov 2', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('374ca34a-4fb3-4354-9b4a-dd604052111b', 'd3b13b18-1ba8-40ed-b79f-27f556cd458f', 'Goreacichin Alexei Patent AB224538', 'or.Cahul str.31 August 13g, tr.37', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('ad1e0350-1d2f-427e-8bbf-e83e42aa044d', 'd3b13b18-1ba8-40ed-b79f-27f556cd458f', 'Urum Ivan II', 's.Congaz str.Lenin 51A', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('c12f2ed5-1f36-42ce-aafe-e5dbdd98734b', 'd3b13b18-1ba8-40ed-b79f-27f556cd458f', 'Altahdji SRL', 'or.Cahul str.M.Eminescu 24 a', 4);

-- 2026-04-15 (Ср, неделя 3): 7 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('9fb69afa-4f29-49c4-8429-aeaef38f9bd4', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-15', 'Маршрут Юг 2026-04-15', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('263855b1-e3b6-44d5-943b-10ec8335ad54', '9fb69afa-4f29-49c4-8429-aeaef38f9bd4', 'Record Prosper SRL', 'or.Leova str.Stefan cel Mare 91', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('eb740901-ab58-4857-a8b4-1d5b7cf2a6c7', '9fb69afa-4f29-49c4-8429-aeaef38f9bd4', 'Micul Print SA', 'or.Leova str.Independentei 24', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('3427513a-28a3-4536-a112-04586ae34bb4', '9fb69afa-4f29-49c4-8429-aeaef38f9bd4', 'Vicol Claudia II', 'or.Leova str.Independentii 15', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('e832a733-07f7-48eb-bfc2-300b64992dcb', '9fb69afa-4f29-49c4-8429-aeaef38f9bd4', 'Cociu Tatiana II', 'or.Leova str.Constantin Pruteanu nr.5', 4);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('895640b3-2a40-41c5-b8f4-98946e7ea5f5', '9fb69afa-4f29-49c4-8429-aeaef38f9bd4', 'Atlanta-Cunev II', 'or. Cantemir  str.Stefan Voda mag. N1', 5);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('c435937b-2a74-43d5-b3cb-7313f3aedad5', '9fb69afa-4f29-49c4-8429-aeaef38f9bd4', 'Lazurum SRL', 'r-nul Leova s.Iargara  str.31 august 23/1', 6);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('ce566055-b7e1-4c28-b899-092a333ab15d', '9fb69afa-4f29-49c4-8429-aeaef38f9bd4', 'Avid-Com SRL', 'or.Leova str.Stefan cel Mare', 7);

-- 2026-04-16 (Чт, неделя 3): 3 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('4d170e6d-5ec1-4bc7-a5a5-5eabcfde4c7f', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-16', 'Маршрут Юг 2026-04-16', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('72996340-ef29-429a-8660-a94c367fda35', '4d170e6d-5ec1-4bc7-a5a5-5eabcfde4c7f', 'Kusadasi SRL', 'or.Comrat str.Pobeda 48', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('b9b8457a-4817-47e1-8a77-5902921aef91', '4d170e6d-5ec1-4bc7-a5a5-5eabcfde4c7f', 'Mavdani-Agro SRL', 'or.Comrat str.Mirnii str-la 20', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('76db7011-8d2c-433d-8b47-db46836b72fa', '4d170e6d-5ec1-4bc7-a5a5-5eabcfde4c7f', 'Kusadasi SRL', 'or.Comrat str.Dimitrov 20', 3);

-- 2026-04-17 (Пт, неделя 3): 7 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('446d54a2-8885-4bc7-b58b-2f2d9d81d7ab', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-17', 'Маршрут Юг 2026-04-17', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('7c305343-bdea-4d6a-8b9f-0fddc4e09cde', '446d54a2-8885-4bc7-b58b-2f2d9d81d7ab', 'Tanov SRL', 'or.Taraclia str.Lenin 173', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('34c10f01-24be-45ae-a9e7-c0510b4b69ee', '446d54a2-8885-4bc7-b58b-2f2d9d81d7ab', 'Shipka SRL', 'or.Vulcanesti str.Plotnicova 6', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('c422e10b-d5fa-4de9-ba28-07e447302fd8', '446d54a2-8885-4bc7-b58b-2f2d9d81d7ab', 'Nik-Ma.Vul SRL', 'or.Vulcanesti str. Gagarin  36/15', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('c1ca0684-7a5a-4422-8e65-8d6e249cd62a', '446d54a2-8885-4bc7-b58b-2f2d9d81d7ab', 'Prezent-Presenti SRL', 'or.Vulcanesti str. Lenina 86', 4);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('43f55032-fd67-4111-975f-c90580706569', '446d54a2-8885-4bc7-b58b-2f2d9d81d7ab', 'Vemastil Grup SRL', 'or.Vulcanesti str. Ceapaev 9', 5);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('307cede2-93ac-4fae-9773-c01ab457fb93', '446d54a2-8885-4bc7-b58b-2f2d9d81d7ab', 'Max Rudenco II', 'or.Vulcanesti str.Frunze 23', 6);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('6cfe3103-9b1c-4ba6-a568-c576393609a6', '446d54a2-8885-4bc7-b58b-2f2d9d81d7ab', 'Selemet V II', 'or.Vulcanesti str.Sovetscaia Armia 50', 7);

-- 2026-04-20 (Пн, неделя 3): 3 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('5af6b93d-cd14-4505-b866-bb4e7506888a', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-20', 'Маршрут Юг 2026-04-20', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('28b18306-b9a7-4e2d-a9bc-3fe6c7659e36', '5af6b93d-cd14-4505-b866-bb4e7506888a', 'SC Unistar SRL', 'or.Cahul str.Alexei Mateevici nr. 12/V, inc.4', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('d6776f9e-977d-443c-abcd-acc7f45f7400', '5af6b93d-cd14-4505-b866-bb4e7506888a', 'Vasigrover SRL', 'or.Cahul str.Republicii 16/16', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('80de884f-b55e-49f4-9db6-fa67b4226ac3', '5af6b93d-cd14-4505-b866-bb4e7506888a', 'SC Unistar SRL', 'or.Cahul str.F.Seliviorstov 9E', 3);

-- 2026-04-21 (Вт, неделя 3): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('d6918000-6833-419c-b90b-c5d01294c376', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-21', 'Маршрут Юг 2026-04-21', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('1909d0aa-b459-4938-b090-8f237a50c4ad', 'd6918000-6833-419c-b90b-c5d01294c376', 'Calciscova & S SRL', 'or.Ceadir Lunga str.M Lomonosov 2', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('a9ef1356-22fe-41f4-8f39-9863bdfb3fe6', 'd6918000-6833-419c-b90b-c5d01294c376', 'Goreacichin Alexei Patent AB224538', 'or.Cahul str.31 August 13g, tr.37', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('e1b1d346-8634-4b59-a55b-c730d53e1200', 'd6918000-6833-419c-b90b-c5d01294c376', 'Urum Ivan II', 's.Congaz str.Lenin 51A', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('f0f214c7-ec09-44a9-b150-870ea92ec021', 'd6918000-6833-419c-b90b-c5d01294c376', 'Altahdji SRL', 'or.Cahul str.M.Eminescu 24 a', 4);

-- 2026-04-22 (Ср, неделя 4): 6 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('ac9afeee-7269-4649-9dec-5a6e073c7811', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-22', 'Маршрут Юг 2026-04-22', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('5ab768be-86fc-4d61-b441-495a3c4556ef', 'ac9afeee-7269-4649-9dec-5a6e073c7811', 'Capit Maria II', 'or.Leova str.Idependentei 23/18', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('07d35b4b-7a92-4b8a-9ef6-ea8c992ebb50', 'ac9afeee-7269-4649-9dec-5a6e073c7811', 'Cociu Tatiana II', 'or.Leova str.Constantin Pruteanu nr.5', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('350f0fac-b99d-41a9-8510-55a51d636424', 'ac9afeee-7269-4649-9dec-5a6e073c7811', 'Atlanta-Cunev II', 'or. Cantemir  str.Stefan Voda mag. N1', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('23776a16-9383-4419-9a0c-c526431104ba', 'ac9afeee-7269-4649-9dec-5a6e073c7811', 'Buraga Ala Vasile Patenta AB 217619', 'or. Leova str. Stefan cel Mare 68', 4);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('b2996a88-48e5-4f9e-b6e5-8b303365e3d5', 'ac9afeee-7269-4649-9dec-5a6e073c7811', 'Lazurum SRL', 'r-nul Leova s.Iargara  str.31 august 23/1', 5);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('fd36026f-c1fe-4c9a-8c09-991f2f8fb75f', 'ac9afeee-7269-4649-9dec-5a6e073c7811', 'Avid-Com SRL', 'or.Leova str.Stefan cel Mare', 6);

-- 2026-04-23 (Чт, неделя 4): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('5fbff63f-31db-4d8f-8d0f-07729606aebb', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-23', 'Маршрут Юг 2026-04-23', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('668b2749-5850-47ea-948a-02e0b01ac23e', '5fbff63f-31db-4d8f-8d0f-07729606aebb', 'Kusadasi SRL', 'or.Comrat str.Pobeda 48', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('aabca200-2666-488b-b3c9-56f2cade883c', '5fbff63f-31db-4d8f-8d0f-07729606aebb', 'Mavdani-Agro SRL', 'or.Comrat str.Mirnii str-la 20', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('be65a3d5-a70d-4548-86c6-f2b63dd3f2d5', '5fbff63f-31db-4d8f-8d0f-07729606aebb', 'Kusadasi SRL', 'or.Comrat str.Dimitrov 20', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('7f1ba14f-e3e3-4629-b336-569d8a8fc25a', '5fbff63f-31db-4d8f-8d0f-07729606aebb', 'Ininih-Grup SRL', 'or.Comrat str.Gavriliuc 15', 4);

-- 2026-04-24 (Пт, неделя 4): 6 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('46ef2e90-921c-4070-8b5c-bcb1a41fcef7', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-24', 'Маршрут Юг 2026-04-24', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('eee92c98-be02-493d-b450-c40bc200315b', '46ef2e90-921c-4070-8b5c-bcb1a41fcef7', 'Tanov SRL', 'or.Taraclia str.Lenin 173', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('c02c99de-1422-4abd-af91-af81859d3b17', '46ef2e90-921c-4070-8b5c-bcb1a41fcef7', 'Popovici Stepan II', 'or.Vulcanesti str.Nicutova 41', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('c4312dc8-311f-41e4-90c5-e91de2dcf245', '46ef2e90-921c-4070-8b5c-bcb1a41fcef7', 'Continent Terzi II', 'or.Vulcanesti str.Lenina 110', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('18fd7346-f5f7-4684-af88-b17a67a4aea9', '46ef2e90-921c-4070-8b5c-bcb1a41fcef7', 'Prezent-Presenti SRL', 'or.Vulcanesti str. Lenina 86', 4);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('0bc9222a-01a5-4128-ae78-c3580a814505', '46ef2e90-921c-4070-8b5c-bcb1a41fcef7', 'Max Rudenco II', 'or.Vulcanesti str.Frunze 23', 5);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('5195dace-688a-4b9a-b519-c29d02f6a518', '46ef2e90-921c-4070-8b5c-bcb1a41fcef7', 'Nik-Ma.Vul SRL', 'or.Vulcanesti str. Lenin  37а', 6);

-- 2026-04-27 (Пн, неделя 4): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('8c36291b-f303-4161-a0cb-109209b79dc1', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-27', 'Маршрут Юг 2026-04-27', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('4869e466-a344-49fd-8aff-47e7c7dc5a9f', '8c36291b-f303-4161-a0cb-109209b79dc1', 'SC Unistar SRL', 'or.Cahul str.Alexei Mateevici nr. 12/V, inc.4', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('d7d82846-5dae-416c-b26c-6574115cd345', '8c36291b-f303-4161-a0cb-109209b79dc1', 'SC Unistar SRL', 'or.Cahul str.F.Seliviorstov 9E', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('21c56b78-71db-4c63-8ef1-429b530cfd42', '8c36291b-f303-4161-a0cb-109209b79dc1', 'Construct Univers SRL', 'or.Cahul str. Fantanilor nr.23/1', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('2b193785-a784-445e-9a3a-6cc00b468ca6', '8c36291b-f303-4161-a0cb-109209b79dc1', 'Modernus SA', 'or.Cahul str.Stefan cel Mare 52', 4);

-- 2026-04-28 (Вт, неделя 4): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('c4794966-2103-466a-a38b-720d08533521', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-04-28', 'Маршрут Юг 2026-04-28', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('5d3382b6-a690-43c3-be6d-11d2e2d22305', 'c4794966-2103-466a-a38b-720d08533521', 'Calciscova & S SRL', 'or.Ceadir Lunga str.M Lomonosov 2', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('52f0cc99-5bf9-4dff-936c-c3c5b464c4cb', 'c4794966-2103-466a-a38b-720d08533521', 'Goreacichin Alexei Patent AB224538', 'or.Cahul str.31 August 13g, tr.37', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('76ecf4ae-129f-4303-b5ce-f6f61a3466cc', 'c4794966-2103-466a-a38b-720d08533521', 'Urum Ivan II', 's.Congaz str.Lenin 51A', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('a9d808da-798a-47a1-b96f-182d0162fbd6', 'c4794966-2103-466a-a38b-720d08533521', 'Altahdji SRL', 'or.Cahul str.M.Eminescu 24 a', 4);

-- 2026-05-01 (Пт, неделя 1): 7 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('0b3e27cb-4c82-4885-9422-ba68a8dccb6d', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-01', 'Маршрут Юг 2026-05-01', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('4df54302-d350-46d8-8eb0-6bd2a6cac42a', '0b3e27cb-4c82-4885-9422-ba68a8dccb6d', 'Tanov SRL', 'or.Taraclia str.Lenin 173', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('a5e887f6-7494-4752-976e-e00577d7c7d7', '0b3e27cb-4c82-4885-9422-ba68a8dccb6d', 'Shipka SRL', 'or.Vulcanesti str.Plotnicova 6', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('792ee1ab-9ad4-46d9-9b28-01e144eac92f', '0b3e27cb-4c82-4885-9422-ba68a8dccb6d', 'Nik-Ma.Vul SRL', 'or.Vulcanesti str. Gagarin  36/15', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('881a1aa4-0886-42e4-8c63-d3c4a87e79c0', '0b3e27cb-4c82-4885-9422-ba68a8dccb6d', 'Prezent-Presenti SRL', 'or.Vulcanesti str. Lenina 86', 4);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('081b0c29-05e0-45b7-b59a-77b82dd5ea74', '0b3e27cb-4c82-4885-9422-ba68a8dccb6d', 'Vemastil Grup SRL', 'or.Vulcanesti str. Ceapaev 9', 5);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('f2d3b71e-e9f5-4bda-aafa-0276fa5380c9', '0b3e27cb-4c82-4885-9422-ba68a8dccb6d', 'Max Rudenco II', 'or.Vulcanesti str.Frunze 23', 6);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('9334bd05-3b7c-4736-891a-4c0cd2efdd29', '0b3e27cb-4c82-4885-9422-ba68a8dccb6d', 'Selemet V II', 'or.Vulcanesti str.Sovetscaia Armia 50', 7);

-- 2026-05-04 (Пн, неделя 1): 3 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('a7be00e0-0b60-49be-a89a-7bd4dbebff19', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-04', 'Маршрут Юг 2026-05-04', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('af9dd1c5-9e08-4980-bef3-51554513f865', 'a7be00e0-0b60-49be-a89a-7bd4dbebff19', 'SC Unistar SRL', 'or.Cahul str.Alexei Mateevici nr. 12/V, inc.4', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('808f86d3-14fb-40a6-90c0-1c7fa6908235', 'a7be00e0-0b60-49be-a89a-7bd4dbebff19', 'Vasigrover SRL', 'or.Cahul str.Republicii 16/16', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('cc0852de-3c6a-4c32-900a-1483d6b9f130', 'a7be00e0-0b60-49be-a89a-7bd4dbebff19', 'SC Unistar SRL', 'or.Cahul str.F.Seliviorstov 9E', 3);

-- 2026-05-05 (Вт, неделя 1): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('a1d1d074-c44f-470c-8754-c2a61851e67f', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-05', 'Маршрут Юг 2026-05-05', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('705ca85f-e930-443b-8887-d9105ea60aa7', 'a1d1d074-c44f-470c-8754-c2a61851e67f', 'Calciscova & S SRL', 'or.Ceadir Lunga str.M Lomonosov 2', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('80cc853e-f98e-451a-b955-7d56021f4720', 'a1d1d074-c44f-470c-8754-c2a61851e67f', 'Goreacichin Alexei Patent AB224538', 'or.Cahul str.31 August 13g, tr.37', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('7bd7aea4-4f35-4a9f-9b48-06e4b59450b0', 'a1d1d074-c44f-470c-8754-c2a61851e67f', 'Urum Ivan II', 's.Congaz str.Lenin 51A', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('c1530a12-a0cd-4cf2-93c8-c387f2bf81b9', 'a1d1d074-c44f-470c-8754-c2a61851e67f', 'Altahdji SRL', 'or.Cahul str.M.Eminescu 24 a', 4);

-- 2026-05-06 (Ср, неделя 1): 7 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('26e5b87c-1914-476e-b98f-775408682141', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-06', 'Маршрут Юг 2026-05-06', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('f6d4b6bb-5f53-4308-95cb-5ba60072e231', '26e5b87c-1914-476e-b98f-775408682141', 'Record Prosper SRL', 'or.Leova str.Stefan cel Mare 91', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('57a66d3c-30dc-40d7-b5ce-f1b1ab718f34', '26e5b87c-1914-476e-b98f-775408682141', 'Micul Print SA', 'or.Leova str.Independentei 24', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('185e1cba-e092-4e19-a2bb-0b3df81e3b13', '26e5b87c-1914-476e-b98f-775408682141', 'Vicol Claudia II', 'or.Leova str.Independentii 15', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('2c66dfcb-ba0f-400b-b36b-b03fb9830492', '26e5b87c-1914-476e-b98f-775408682141', 'Cociu Tatiana II', 'or.Leova str.Constantin Pruteanu nr.5', 4);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('5736b07a-15e4-447d-9457-9c27a8a359b8', '26e5b87c-1914-476e-b98f-775408682141', 'Atlanta-Cunev II', 'or. Cantemir  str.Stefan Voda mag. N1', 5);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('89b95697-57d4-4878-b453-853ab975bc41', '26e5b87c-1914-476e-b98f-775408682141', 'Lazurum SRL', 'r-nul Leova s.Iargara  str.31 august 23/1', 6);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('0e14894e-8d70-421e-a5f9-40be410ffc76', '26e5b87c-1914-476e-b98f-775408682141', 'Avid-Com SRL', 'or.Leova str.Stefan cel Mare', 7);

-- 2026-05-07 (Чт, неделя 1): 3 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('85da76ac-685c-4df6-8f69-322f3b1d41cf', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-07', 'Маршрут Юг 2026-05-07', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('9c953df4-5306-480e-a5e6-3192e3d19ac1', '85da76ac-685c-4df6-8f69-322f3b1d41cf', 'Kusadasi SRL', 'or.Comrat str.Pobeda 48', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('41c42872-7b15-43f2-b2cf-a641fd59a8b8', '85da76ac-685c-4df6-8f69-322f3b1d41cf', 'Mavdani-Agro SRL', 'or.Comrat str.Mirnii str-la 20', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('fb2d6b7f-b4b9-479d-bf39-5cb2005b6c97', '85da76ac-685c-4df6-8f69-322f3b1d41cf', 'Kusadasi SRL', 'or.Comrat str.Dimitrov 20', 3);

-- 2026-05-08 (Пт, неделя 2): 7 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('221d4009-9014-460c-824b-1d6b82c1cdfd', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-08', 'Маршрут Юг 2026-05-08', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('a607f65f-9fc5-4c05-a18c-a93cdc0122f6', '221d4009-9014-460c-824b-1d6b82c1cdfd', 'Tanov SRL', 'or.Taraclia str.Lenin 173', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('f82c56d1-f377-412a-b14b-81dc283fd01f', '221d4009-9014-460c-824b-1d6b82c1cdfd', 'Stroitehnologia SRL', 'or.Taraclia, str. Lenina 191', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('58aacc15-a1fb-4cda-930f-50b635dddfb2', '221d4009-9014-460c-824b-1d6b82c1cdfd', 'Starsina SRL', 'or.Taraclia str.Lenin 141a', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('8e1819ec-35f2-4f0f-bc4e-39509ffabe74', '221d4009-9014-460c-824b-1d6b82c1cdfd', 'Popovici Stepan II', 'or.Vulcanesti str.Nicutova 41', 4);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('8d64a61d-5f87-4993-b7d6-fabfa894d88d', '221d4009-9014-460c-824b-1d6b82c1cdfd', 'Continent Terzi II', 'or.Vulcanesti str.Lenina 110', 5);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('c4b92555-df8e-447b-8dbd-895aec8cae65', '221d4009-9014-460c-824b-1d6b82c1cdfd', 'Prezent-Presenti SRL', 'or.Vulcanesti str. Lenina 86', 6);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('56d8c24a-2fc1-4f53-889d-900022f568a3', '221d4009-9014-460c-824b-1d6b82c1cdfd', 'Max Rudenco II', 'or.Vulcanesti str.Frunze 23', 7);

-- 2026-05-11 (Пн, неделя 2): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('51b03d02-3de5-418f-82e9-fa4bf8c634a5', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-11', 'Маршрут Юг 2026-05-11', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('33b66bb5-5213-4ff8-adb5-020cf3f1192f', '51b03d02-3de5-418f-82e9-fa4bf8c634a5', 'SC Unistar SRL', 'or.Cahul str.Alexei Mateevici nr. 12/V, inc.4', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('219b70c6-1627-4c8a-a70f-06893ae6f869', '51b03d02-3de5-418f-82e9-fa4bf8c634a5', 'SC Unistar SRL', 'or.Cahul str.F.Seliviorstov 9E', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('b20fd4f9-f751-45ae-8985-c6934bf6d7b1', '51b03d02-3de5-418f-82e9-fa4bf8c634a5', 'Construct Univers SRL', 'or.Cahul str. Fantanilor nr.23/1', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('7e001c5d-3b5c-4c45-92f3-76b4d60c9511', '51b03d02-3de5-418f-82e9-fa4bf8c634a5', 'Modernus SA', 'or.Cahul str.Stefan cel Mare 52', 4);

-- 2026-05-12 (Вт, неделя 2): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('70e9969b-aea7-4f5e-93d3-b2ddd6a441dc', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-12', 'Маршрут Юг 2026-05-12', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('643ac163-f27e-4006-8dcc-67a93632bffa', '70e9969b-aea7-4f5e-93d3-b2ddd6a441dc', 'Calciscova & S SRL', 'or.Ceadir Lunga str.M Lomonosov 2', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('279b25a8-ce17-4c31-a9c1-075c4a7c1d41', '70e9969b-aea7-4f5e-93d3-b2ddd6a441dc', 'Goreacichin Alexei Patent AB224538', 'or.Cahul str.31 August 13g, tr.37', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('2efd61a7-4a94-4310-8dfc-6960f0f9a5dc', '70e9969b-aea7-4f5e-93d3-b2ddd6a441dc', 'Urum Ivan II', 's.Congaz str.Lenin 51A', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('1d3795ac-0cdd-4be2-84cc-15d6d69cec9d', '70e9969b-aea7-4f5e-93d3-b2ddd6a441dc', 'Altahdji SRL', 'or.Cahul str.M.Eminescu 24 a', 4);

-- 2026-05-13 (Ср, неделя 2): 6 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('b0dfecfc-ed45-427d-a020-21aab4de99e3', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-13', 'Маршрут Юг 2026-05-13', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('472da283-d238-4d24-928d-d2b1aa9dea30', 'b0dfecfc-ed45-427d-a020-21aab4de99e3', 'Capit Maria II', 'or.Leova str.Idependentei 23/18', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('7ecdb0ca-fb7b-4066-9102-4f7ca7683f34', 'b0dfecfc-ed45-427d-a020-21aab4de99e3', 'Cociu Tatiana II', 'or.Leova str.Constantin Pruteanu nr.5', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('49c3d28b-7b41-4457-8f64-75043c6c5005', 'b0dfecfc-ed45-427d-a020-21aab4de99e3', 'Atlanta-Cunev II', 'or. Cantemir  str.Stefan Voda mag. N1', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('7644d736-e137-414e-b767-b37d5a8fcdef', 'b0dfecfc-ed45-427d-a020-21aab4de99e3', 'Buraga Ala Vasile Patenta AB 217619', 'or. Leova str. Stefan cel Mare 68', 4);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('79e65d21-8a61-4f31-88af-cb038c795ea7', 'b0dfecfc-ed45-427d-a020-21aab4de99e3', 'Lazurum SRL', 'r-nul Leova s.Iargara  str.31 august 23/1', 5);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('3c585751-221d-462e-86d8-4c9c8f0b40f1', 'b0dfecfc-ed45-427d-a020-21aab4de99e3', 'Avid-Com SRL', 'or.Leova str.Stefan cel Mare', 6);

-- 2026-05-14 (Чт, неделя 2): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('f7446197-096d-45e4-9f25-dc0d94c56071', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-14', 'Маршрут Юг 2026-05-14', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('91df5e27-a306-482d-a93e-020523966f95', 'f7446197-096d-45e4-9f25-dc0d94c56071', 'Kusadasi SRL', 'or.Comrat str.Pobeda 48', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('ecff72e8-e040-4dfe-9ed7-5a0ffc762bb6', 'f7446197-096d-45e4-9f25-dc0d94c56071', 'Mavdani-Agro SRL', 'or.Comrat str.Mirnii str-la 20', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('ee5bb734-cbf9-4738-951a-d3770ac90360', 'f7446197-096d-45e4-9f25-dc0d94c56071', 'Kusadasi SRL', 'or.Comrat str.Dimitrov 20', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('2b1a8c73-334f-4d31-bbe8-900c21c8a5b6', 'f7446197-096d-45e4-9f25-dc0d94c56071', 'Ininih-Grup SRL', 'or.Comrat str.Gavriliuc 15', 4);

-- 2026-05-15 (Пт, неделя 3): 7 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('4200349d-f316-4fbf-b351-06a3ca45827c', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-15', 'Маршрут Юг 2026-05-15', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('8527de08-5538-4d0c-af08-c646b8569512', '4200349d-f316-4fbf-b351-06a3ca45827c', 'Tanov SRL', 'or.Taraclia str.Lenin 173', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('095b2db7-f3ff-493b-a3b9-a835792b8cb2', '4200349d-f316-4fbf-b351-06a3ca45827c', 'Shipka SRL', 'or.Vulcanesti str.Plotnicova 6', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('8c39e1c2-e685-4e1c-859b-41cc3c81c632', '4200349d-f316-4fbf-b351-06a3ca45827c', 'Nik-Ma.Vul SRL', 'or.Vulcanesti str. Gagarin  36/15', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('ab7ebc0e-f470-4968-862f-2f6d574119d4', '4200349d-f316-4fbf-b351-06a3ca45827c', 'Prezent-Presenti SRL', 'or.Vulcanesti str. Lenina 86', 4);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('0e6bb501-7558-493f-9e88-b65ad9db98a2', '4200349d-f316-4fbf-b351-06a3ca45827c', 'Vemastil Grup SRL', 'or.Vulcanesti str. Ceapaev 9', 5);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('51479ebe-2c4a-44da-86b4-6ef7a848387f', '4200349d-f316-4fbf-b351-06a3ca45827c', 'Max Rudenco II', 'or.Vulcanesti str.Frunze 23', 6);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('fd3ab12c-e9d7-409a-a5dc-c0b8ea15fe3a', '4200349d-f316-4fbf-b351-06a3ca45827c', 'Selemet V II', 'or.Vulcanesti str.Sovetscaia Armia 50', 7);

-- 2026-05-18 (Пн, неделя 3): 3 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('8830638b-b5fd-4790-aed5-1270545b9d04', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-18', 'Маршрут Юг 2026-05-18', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('e0e1eaf4-5287-4248-a32c-d28c231bbd2a', '8830638b-b5fd-4790-aed5-1270545b9d04', 'SC Unistar SRL', 'or.Cahul str.Alexei Mateevici nr. 12/V, inc.4', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('ae748bda-2cd9-49f2-8ab6-9d2fa63f586a', '8830638b-b5fd-4790-aed5-1270545b9d04', 'Vasigrover SRL', 'or.Cahul str.Republicii 16/16', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('169095eb-35a2-4e2f-a4f2-80523b989f91', '8830638b-b5fd-4790-aed5-1270545b9d04', 'SC Unistar SRL', 'or.Cahul str.F.Seliviorstov 9E', 3);

-- 2026-05-19 (Вт, неделя 3): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('bd569420-cc5d-491e-ae2c-0d45968e2dc9', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-19', 'Маршрут Юг 2026-05-19', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('30384428-8943-495e-84b7-6c30eeab97f9', 'bd569420-cc5d-491e-ae2c-0d45968e2dc9', 'Calciscova & S SRL', 'or.Ceadir Lunga str.M Lomonosov 2', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('078822e4-ab1e-4eb5-a8a8-8729902f8db6', 'bd569420-cc5d-491e-ae2c-0d45968e2dc9', 'Goreacichin Alexei Patent AB224538', 'or.Cahul str.31 August 13g, tr.37', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('404d2d4b-87f6-4a62-9c5e-14511e991155', 'bd569420-cc5d-491e-ae2c-0d45968e2dc9', 'Urum Ivan II', 's.Congaz str.Lenin 51A', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('2862c06c-de3b-4ba1-a732-c1a38f1e0b5a', 'bd569420-cc5d-491e-ae2c-0d45968e2dc9', 'Altahdji SRL', 'or.Cahul str.M.Eminescu 24 a', 4);

-- 2026-05-20 (Ср, неделя 3): 7 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('b97b6760-e430-4f72-af16-7ad50bf2b9ab', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-20', 'Маршрут Юг 2026-05-20', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('cb46f354-3907-4cfb-8ef6-47e184d6fe89', 'b97b6760-e430-4f72-af16-7ad50bf2b9ab', 'Record Prosper SRL', 'or.Leova str.Stefan cel Mare 91', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('11a7a1a2-dc28-4b4e-b669-a30109b62911', 'b97b6760-e430-4f72-af16-7ad50bf2b9ab', 'Micul Print SA', 'or.Leova str.Independentei 24', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('e5a87302-f1b1-4f48-898e-9ea995559012', 'b97b6760-e430-4f72-af16-7ad50bf2b9ab', 'Vicol Claudia II', 'or.Leova str.Independentii 15', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('d3339d2e-3313-4e05-ac39-c4270a96bcaf', 'b97b6760-e430-4f72-af16-7ad50bf2b9ab', 'Cociu Tatiana II', 'or.Leova str.Constantin Pruteanu nr.5', 4);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('839d7f9a-e697-4298-ba68-49e34de0f463', 'b97b6760-e430-4f72-af16-7ad50bf2b9ab', 'Atlanta-Cunev II', 'or. Cantemir  str.Stefan Voda mag. N1', 5);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('ce16d041-4c91-4d60-8254-21c7d68f5784', 'b97b6760-e430-4f72-af16-7ad50bf2b9ab', 'Lazurum SRL', 'r-nul Leova s.Iargara  str.31 august 23/1', 6);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('c0b5cd72-1001-4031-94bc-e2d505ff6f4f', 'b97b6760-e430-4f72-af16-7ad50bf2b9ab', 'Avid-Com SRL', 'or.Leova str.Stefan cel Mare', 7);

-- 2026-05-21 (Чт, неделя 3): 3 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('697b43b2-ddc9-494d-8aa3-74089afe0407', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-21', 'Маршрут Юг 2026-05-21', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('ebf6a9ff-7592-4848-a707-fb09f8b2d94b', '697b43b2-ddc9-494d-8aa3-74089afe0407', 'Kusadasi SRL', 'or.Comrat str.Pobeda 48', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('685c7627-db0a-47ca-9c8b-d2847b275814', '697b43b2-ddc9-494d-8aa3-74089afe0407', 'Mavdani-Agro SRL', 'or.Comrat str.Mirnii str-la 20', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('6b2400c7-bc10-40b2-a8ae-2f8666e10192', '697b43b2-ddc9-494d-8aa3-74089afe0407', 'Kusadasi SRL', 'or.Comrat str.Dimitrov 20', 3);

-- 2026-05-22 (Пт, неделя 4): 6 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('979b3e8a-58e8-4e44-ae4c-d0635de6548d', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-22', 'Маршрут Юг 2026-05-22', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('7b93c342-5c0a-4fdb-967f-cc903f127441', '979b3e8a-58e8-4e44-ae4c-d0635de6548d', 'Tanov SRL', 'or.Taraclia str.Lenin 173', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('258b40e2-1b03-4196-a4b4-d275fbae0054', '979b3e8a-58e8-4e44-ae4c-d0635de6548d', 'Popovici Stepan II', 'or.Vulcanesti str.Nicutova 41', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('079d64bf-f72d-405e-b5c0-758b933d4f02', '979b3e8a-58e8-4e44-ae4c-d0635de6548d', 'Continent Terzi II', 'or.Vulcanesti str.Lenina 110', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('fe54fc03-cd21-4904-93b9-d9b2f65ed7e7', '979b3e8a-58e8-4e44-ae4c-d0635de6548d', 'Prezent-Presenti SRL', 'or.Vulcanesti str. Lenina 86', 4);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('19b33b67-aefd-4732-9722-90def3031c46', '979b3e8a-58e8-4e44-ae4c-d0635de6548d', 'Max Rudenco II', 'or.Vulcanesti str.Frunze 23', 5);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('c05739d5-7e98-4bbc-81d1-b982057f29b4', '979b3e8a-58e8-4e44-ae4c-d0635de6548d', 'Nik-Ma.Vul SRL', 'or.Vulcanesti str. Lenin  37а', 6);

-- 2026-05-25 (Пн, неделя 4): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('4a914e7f-5313-4c22-a151-40b1ce391f0a', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-25', 'Маршрут Юг 2026-05-25', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('b9c41664-033f-4902-8acc-cd269d329066', '4a914e7f-5313-4c22-a151-40b1ce391f0a', 'SC Unistar SRL', 'or.Cahul str.Alexei Mateevici nr. 12/V, inc.4', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('207be56b-f2c9-43c1-8ea0-f80794a46606', '4a914e7f-5313-4c22-a151-40b1ce391f0a', 'SC Unistar SRL', 'or.Cahul str.F.Seliviorstov 9E', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('9612710c-0c5b-49bb-9e47-b9370e8a7bf8', '4a914e7f-5313-4c22-a151-40b1ce391f0a', 'Construct Univers SRL', 'or.Cahul str. Fantanilor nr.23/1', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('4336fff5-7ddb-470d-a638-87865c233fe2', '4a914e7f-5313-4c22-a151-40b1ce391f0a', 'Modernus SA', 'or.Cahul str.Stefan cel Mare 52', 4);

-- 2026-05-26 (Вт, неделя 4): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('dd6d585c-1d44-4d84-b297-e3f5df2ad45f', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-26', 'Маршрут Юг 2026-05-26', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('fec2d39b-eedf-4c08-a154-bae405473f00', 'dd6d585c-1d44-4d84-b297-e3f5df2ad45f', 'Calciscova & S SRL', 'or.Ceadir Lunga str.M Lomonosov 2', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('96cf4439-3ee4-4ccf-a885-f043bb61277f', 'dd6d585c-1d44-4d84-b297-e3f5df2ad45f', 'Goreacichin Alexei Patent AB224538', 'or.Cahul str.31 August 13g, tr.37', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('32917c94-33dc-44ce-8d8f-e2d75cfcebe7', 'dd6d585c-1d44-4d84-b297-e3f5df2ad45f', 'Urum Ivan II', 's.Congaz str.Lenin 51A', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('5e2d98eb-5ab9-4037-ad37-05a62cf594bb', 'dd6d585c-1d44-4d84-b297-e3f5df2ad45f', 'Altahdji SRL', 'or.Cahul str.M.Eminescu 24 a', 4);

-- 2026-05-27 (Ср, неделя 4): 6 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('22fbb388-5908-4ac0-9429-4d82aa758224', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-27', 'Маршрут Юг 2026-05-27', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('b1baad68-6fc3-43c4-80bd-5a83c0dbc145', '22fbb388-5908-4ac0-9429-4d82aa758224', 'Capit Maria II', 'or.Leova str.Idependentei 23/18', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('59f6bdb5-a42c-4ec5-b92d-b122af234a54', '22fbb388-5908-4ac0-9429-4d82aa758224', 'Cociu Tatiana II', 'or.Leova str.Constantin Pruteanu nr.5', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('d47bb1fd-6248-4660-9c26-c284ab55df98', '22fbb388-5908-4ac0-9429-4d82aa758224', 'Atlanta-Cunev II', 'or. Cantemir  str.Stefan Voda mag. N1', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('cce55689-be7d-42ca-8c4a-9445cec9e0a6', '22fbb388-5908-4ac0-9429-4d82aa758224', 'Buraga Ala Vasile Patenta AB 217619', 'or. Leova str. Stefan cel Mare 68', 4);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('a2f02197-4b7c-41aa-9d3a-1aced5e65488', '22fbb388-5908-4ac0-9429-4d82aa758224', 'Lazurum SRL', 'r-nul Leova s.Iargara  str.31 august 23/1', 5);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('eb1286ff-9892-4c1e-a7a9-c6e6defddf7f', '22fbb388-5908-4ac0-9429-4d82aa758224', 'Avid-Com SRL', 'or.Leova str.Stefan cel Mare', 6);

-- 2026-05-28 (Чт, неделя 4): 4 точек
INSERT INTO routes (id, agent_id, manager_id, route_date, title, status)
VALUES ('4bfac1b7-fcaf-4571-8d85-d8eef942f0ec', '0559df5a-5f1a-4be2-9b44-aaa9b75985f3', '6907dbd9-775c-4ebd-81b5-c1955c76e82b', '2026-05-28', 'Маршрут Юг 2026-05-28', 'active')
ON CONFLICT (agent_id, route_date) DO NOTHING;
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('c0985ba5-189d-4b29-ab64-157a07a4844a', '4bfac1b7-fcaf-4571-8d85-d8eef942f0ec', 'Kusadasi SRL', 'or.Comrat str.Pobeda 48', 1);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('2676130c-5140-49cb-a8e1-7f3fdb3ec279', '4bfac1b7-fcaf-4571-8d85-d8eef942f0ec', 'Mavdani-Agro SRL', 'or.Comrat str.Mirnii str-la 20', 2);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('26c9a2af-2bd6-4caa-aeb5-e49fbe7245fa', '4bfac1b7-fcaf-4571-8d85-d8eef942f0ec', 'Kusadasi SRL', 'or.Comrat str.Dimitrov 20', 3);
INSERT INTO route_points (id, route_id, name, address, sort_order)
VALUES ('c01c8e29-c3e2-4f54-a67b-9f0373f035b4', '4bfac1b7-fcaf-4571-8d85-d8eef942f0ec', 'Ininih-Grup SRL', 'or.Comrat str.Gavriliuc 15', 4);
