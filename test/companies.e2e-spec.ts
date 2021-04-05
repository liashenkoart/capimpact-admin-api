import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import defaults from 'superagent-defaults';
import supertest from 'supertest';
import faker from 'faker';
import { UsersService } from '../src/modules/users/user.service';
import { IndustryTreeService } from '../src/modules/industry-tree/industry-tree.service';
import { CapabilityTreeService } from '../src/modules/capability-tree/capability-tree.service';
import
 { CapabilityService } from '../src/modules/capability/services/capability.service';
import { KpiLibService } from '../src/modules/kpi-lib/kpi-lib.service';
import { AuthService } from '../src/modules/auth/auth.service';
import { User } from '../src/modules/users/user.entity';
import { Company } from '../src/modules/company/company.entity';
import { ApplicationModule } from '../src/app.module';
import { Chance } from 'chance';
import { COMPANY_API_TAG, COMPANY_NOT_FOUND_ERROR } from '../src/modules/company/company.constants';
import { INDUSTRY_TREE_NOT_FOUND_ERROR } from '../src/modules/industry-tree/industry-tree.constants';
import { CAPABILITY_TREE_API_TAG, 
         CapabilityTreeTypes
        } from '../src/modules/capability-tree/capability-tree.constants';
import { CAPABILITY_API_TAG } from '../src/modules/capability/capability.constants';
import { get, sortBy } from 'lodash';
import { IndustryTree } from '../src/modules/industry-tree/industry-tree.entity';
import { CapabilityTree } from '../src/modules/capability-tree/capability-tree.entity';
import { Capability } from '../src/modules/capability/capability.entity';
import { flattenTree, asyncForEach } from '../src/lib/sorting';
import { CompanyService } from '../src/modules/company/services';
import { GroupTagService} from '../src/modules/grouptag/grouptag.service';
import { GroupFilterService } from '../src/modules/groupfilter/groupfilter.service';
import { v4 as uuid } from "uuid";
import { valueFromAST } from 'graphql';

const fake = new Chance();

function listToTree(data, options?) {
  options = options || {};
  var ID_KEY = options.idKey || 'id';
  var PARENT_KEY = options.parentKey || 'parentId';
  var CHILDREN_KEY = options.childrenKey || 'children';

  var tree = [],
    childrenOf = {};
  var item, id, parentId;

  for (var i = 0, length = data.length; i < length; i++) {
    item = data[i];
    id = item[ID_KEY];
    parentId = item[PARENT_KEY] || 0;
    // every item may have children
    childrenOf[id] = childrenOf[id] || [];
    // init its children
    item[CHILDREN_KEY] = childrenOf[id];
    if (parentId != 0) {
      // init its parent's children object
      childrenOf[parentId] = childrenOf[parentId] || [];

      const { capability, ...rest } = item;
      // push it into its parent's children object
      childrenOf[parentId].push(item);
    } else {
      tree.push(item);
    }
  }

  return tree;
}

function makeArray<T>(length: number, generator: () => T): T[] {
  return Array.from({ length }, generator)
}

describe('App (e2e)', () => {
  let app: INestApplication;
  let request;
  let userSrv: UsersService;
  let authSrv: AuthService;
  let industryTreeSrv: IndustryTreeService;
  let capabilityTreeSrv: CapabilityTreeService;
  let capabilitySrv: CapabilityService;
  let companySrv: CompanyService;
  let kpiLibSrv: KpiLibService;
  let groupTagsSrv: GroupTagService;
  let groupFiltersSrv: GroupFilterService;
  let user: User;
  const userEmail = faker.internet.email();
  const userPassword = fake.string({ length: 8 });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApplicationModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    userSrv = moduleFixture.get<UsersService>(UsersService);
    authSrv = moduleFixture.get<AuthService>(AuthService);
    industryTreeSrv = moduleFixture.get<IndustryTreeService>(IndustryTreeService);
    capabilityTreeSrv = moduleFixture.get<CapabilityTreeService>(CapabilityTreeService);
    capabilitySrv = moduleFixture.get<CapabilityService>(CapabilityService);
    companySrv = moduleFixture.get<CompanyService>(CompanyService);
    kpiLibSrv = moduleFixture.get<KpiLibService>(KpiLibService);
    groupTagsSrv = moduleFixture.get<GroupTagService>(GroupTagService);
    groupFiltersSrv = moduleFixture.get<GroupFilterService>(GroupFilterService);
    
    await app.init();
    request = defaults(supertest(app.getHttpServer()));
  });



  const findTreeThatHaveSomethingToClone = async industries => {
    for (let index = 0; index < industries.length; index++) {
      const tree = await capabilityTreeSrv.getAllChildrenOfIndustry(industries[index].id);
      if (tree.length > 10) {
        return industries[index];
      }
    }
    return industries[0];
  };

  const waitForCloningProcess = (clonedId: number, newId: number) =>
      new Promise(async (resolve, reject) => {
       jest.setTimeout(30000);

        const { body } = await request.get(
          `/${CAPABILITY_TREE_API_TAG}/clonning-status?clonedId=${clonedId}&newId=${newId}`
        );
        if (body.progress < 100) {
          setTimeout(async () => resolve(await waitForCloningProcess(clonedId, newId)), 2000);
        } else {
         // jest.setTimeout(5000);

          setTimeout(async () => resolve(body), 2000);
        }
      });

  const createCompanyHelper = async () => {

    const name = faker.company.companyName();

    const industries: IndustryTree[] = await industryTreeSrv.findSixDigitsCodeIndustries();

    const clonedIndustry: IndustryTree = await findTreeThatHaveSomethingToClone(industries);

    const {
      body: { newNodeId, clonedNodeId, clone, company_id },
    } = await request.post(`/${COMPANY_API_TAG}`).send({ name, industry_id: clonedIndustry.id });

    if (clone) {
      await waitForCloningProcess(clonedNodeId, newNodeId);
    }

    return companySrv.findOneById(company_id);
  };

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    user = await userSrv.create({ email: userEmail, password: userPassword });
    const { access_token } = await authSrv.login({ email: userEmail, password: userPassword });
    request.set('Authorization', `Bearer ${access_token}`);
  });

  afterEach(async () => {
    await userSrv.remove(user.id);
  });

  describe(`CompanyModule GET ${COMPANY_API_TAG}`, () => {
    it('Should return valid company', async () => {
      const { body: companyList, status } = await request.get(`/${COMPANY_API_TAG}`);

      expect(status).toBe(200);

      const randomCompany: Company = faker.random.arrayElement(companyList);

      const { body, status: foundCompanyStatus } = await request.get(
        `/${COMPANY_API_TAG}/${randomCompany.id}`
      );
      const foundCompany: Company = body;

      expect(foundCompany.id).toBe(randomCompany.id);
      expect(foundCompany.name).toBe(randomCompany.name);
      expect(foundCompany.cid).toBe(randomCompany.cid);
      expect(foundCompany.user_id).toBe(randomCompany.user_id);
      expect(foundCompany.industry_id).toBe(randomCompany.industry_id);
      expect(foundCompany.industry).toStrictEqual(randomCompany.industry);

      expect(foundCompanyStatus).toBe(200);
    });

    it('Should return paginated list', async () => {
   
      const list: Company[] = await companySrv.companyRepository.find({ order: { name: 'ASC'}});
      const maxNumber = parseInt((String((list.length/100)*10)),10);
      const limit = maxNumber;
      const skip = maxNumber;

      const { body: companyList, status } = await request.get(`/${COMPANY_API_TAG}?skip=${skip}&limit=${limit}`);

      expect(status).toBe(200);
      expect(limit).toBe(companyList.length);

      list.slice(skip,limit).forEach((company,i) => {
        expect(company.name).toBe(companyList[i].name);
      })
    });

    it('Should return 404 error', async () => {
      const randomId = faker.random.number({
        min: -1,
        max: -1000,
      });
      const { body } = await request.get(`/${COMPANY_API_TAG}/${randomId}`);

      expect(get(body, 'statusCode')).toBe(404);
      expect(get(body, 'message')).toBe(COMPANY_NOT_FOUND_ERROR);
    });

    it('Should search companies by search key', async () => {
      jest.setTimeout(90000);
      const companyList: Company[] = await Promise.all([
        await createCompanyHelper(),
        await createCompanyHelper(),
        await createCompanyHelper(),
      ]);

      const randomWord = uuid();

      await asyncForEach(companyList, async ({ id, name, cid }: Company) => {
        await request
          .post(`/${COMPANY_API_TAG}/${id}`)
          .send({ name: `${randomWord}-${name}`, cid });
      });

      const { body: searchedList } = await request.get(`/${COMPANY_API_TAG}?search=${randomWord}`);

      sortBy(searchedList,'name').forEach(({ name }: Company) => {
        expect(name.includes(randomWord)).toBeTruthy();
      });

      await asyncForEach(companyList, async ({ id }: Company) => {
        await request.delete(`/${COMPANY_API_TAG}/${id}`);
      });
    });

  //  jest.setTimeout(5000);
  });


  describe(`CompanyModule POST ${COMPANY_API_TAG}`, () => {

    it.only('Should update group filters of company', async () => {
      jest.setTimeout(90000);
      const company: Company = await createCompanyHelper();
      const companyId = company.id;

      let groupFilters = [];

      for(let i = 0; i < 5; i++) {
        const test =  {
          name: faker.random.word(),
          companyId,
          parentId: null
        }
        groupFilters.push(test);
      }

      await asyncForEach(groupFilters,async (item) => {
       const parentGr = await groupFiltersSrv.create(item);
       const entity = {
            name: faker.random.word(),
            companyId,
            parentId: parentGr.id,
            filters: makeArray(5, faker.random.word).map((value) => value)
        }
       await groupFiltersSrv.create(entity as any);
      })

      groupFilters = await groupFiltersSrv.findAll({ companyId });

    const list =  listToTree(groupFilters);

      const newCompanyTree = await capabilityTreeSrv.treeByCompanyTreeWithTags(company.id);
      
      const randomChild = faker.random.arrayElement(newCompanyTree.children);

       const nodesUpdate = [];
       await asyncForEach(randomChild.children, async ({id, cap_name}) => {
         const filters = {};
        
        list.forEach((group) => {
           const flGrKey = `${group.id}_${group.name}`;
           filters[flGrKey] = {};
           group.children.forEach(el => {
            const subFlgRKey = `${el.id}_${el.name}`;
            filters[flGrKey][subFlgRKey] = faker.random.arrayElements(el.filters,faker.random.number({min:1, max:el.filters.length})).map((v) => ({ label: v, value: v}))
           });
         })

        nodesUpdate.push({
          id,
          name:cap_name,
          filters
      })
      })

      const {body } =   await request
      .post(`/${CAPABILITY_API_TAG}/filters/bulk/${company.id}`)
      .send(nodesUpdate);
          

      body.forEach((node) => {
        const prevDev = nodesUpdate.find((n) => n.id == node.capability_tree_id);
        expect(node.filters).toEqual(prevDev.filters)
     });
   
    jest.setTimeout(5000);
    })
  
    it('Should update group tags of company', async () => {
      jest.setTimeout(90000);
      const company: Company = await createCompanyHelper();
      const companyId = company.id;

      let groupTags = [];


      for(let i = 0; i < 5; i++) {
        const test =  {
          name: faker.random.word(),
          companyId,
          tags:  makeArray(5, faker.random.word).map((value) => value)
        }
        groupTags.push(test);
      }

      await asyncForEach(groupTags,async (item) => {
       await groupTagsSrv.create(item);
      })
     
      groupTags = await groupTagsSrv.findAll({ companyId })

      const newCompanyTree = await capabilityTreeSrv.treeByCompanyTreeWithTags(company.id);
      
      const randomChild = faker.random.arrayElement(newCompanyTree.children);

       const nodesUpdate = [];
       await asyncForEach(randomChild.children, async ({id, cap_name}) => {
         const tags = {};
        
        groupTags.forEach((group) => {
           tags[`${group.id}_${group.name}`] = faker.random.arrayElements(group.tags,faker.random.number({min:1, max:group.tags.length})).map((v) => ({ label: v, value: v}))
         })

        nodesUpdate.push({
          id,
          name:cap_name,
          tags
      })
      })

      const {body } =   await request
        .post(`/${CAPABILITY_API_TAG}/tags/bulk/${company.id}`)
        .send(nodesUpdate);

        console.log(company)

  
        body.forEach((node) => {
           const prevDev = nodesUpdate.find((n) => n.id == node.capability_tree_id);
           expect(node.tags).toEqual(prevDev.tags)
        });
      
      jest.setTimeout(5000);
    })
  })

  describe(`CompanyModule POST ${COMPANY_API_TAG}`, () => {
    it('Should create new company and clone industry tree', async () => {
     jest.setTimeout(90000);
      const company: Company = await createCompanyHelper();

      const { body: newCompanyTree } = await request.get(
        `/${CAPABILITY_TREE_API_TAG}/company?company_id=${company.id}`
      );

      const flattenedClonedIndustryTree: CapabilityTree[] = await capabilityTreeSrv.getAllChildrenOfIndustry(
        company.industry_id
      );

      const flattenedCompanyTRee: CapabilityTree[] = flattenTree(newCompanyTree, 'children');

      flattenedClonedIndustryTree.shift();
      flattenedCompanyTRee.shift();

      expect(flattenedCompanyTRee.length).toBe(flattenedClonedIndustryTree.length);

      await asyncForEach(flattenedCompanyTRee, async (companyCap: CapabilityTree, index) => {
        expect(companyCap.cap_name).toBe(flattenedClonedIndustryTree[index].cap_name);
        expect(companyCap.capability_lib_id).toBe(
          flattenedClonedIndustryTree[index].capability_lib_id
        );
        expect(companyCap.tags).toEqual(flattenedClonedIndustryTree[index].tags);
        expect(companyCap.type).toBe(CapabilityTreeTypes.COMPANY);
        expect(flattenedClonedIndustryTree[index].type).toBe(CapabilityTreeTypes.INDUSTRY);

        const companyCapability: Capability = await capabilitySrv.findOneById(
          companyCap.capabilityId
        );

        expect(companyCap.cap_name).toBe(companyCapability.name);
        // expect(companyCapability.kpis).toBe(
        //   get(flattenedClonedIndustryTree[index], 'capability.kpis', null)
        // );
      });

      const { body, status:   foundCompanyStatus } = await request.get(
        `/${COMPANY_API_TAG}/${company.id}`
      );
      const foundCompany: Company = body;

      expect(foundCompany.name).toBe(company.name);
      expect(foundCompany.industry_id).toBe(company.industry_id);

      expect(   foundCompanyStatus   ).toBe(200);

      await request.delete(`/${COMPANY_API_TAG}/${company.id}`);
     // jest.setTimeout(5000);
    });

    it('Should return 201 status on successfully update', async () => {
     // jest.setTimeout(90000);
      const newCompany: Company = await createCompanyHelper();
      const newName = faker.company.companyName();
      const newCid = faker.company.companyName();

      const { status } = await request
        .post(`/${COMPANY_API_TAG}/${newCompany.id}`)
        .send({ name: newName, cid: newCid });

      expect(status).toBe(201);
      const updatedCompany = await companySrv.companyRepository.findOne(newCompany.id);

      expect(updatedCompany.name).toBe(newName);
      expect(updatedCompany.cid).toBe(newCid);

      await request.delete(`/${COMPANY_API_TAG}/${newCompany.id}`);
     // jest.setTimeout(5000);
    });

    it('Should return 404 error with not existing industry_id', async () => {
      const notExistingIndustryId = faker.random.number({
        min: -1,
        max: -1000,
      });
      const name = faker.company.companyName();

      const { body } = await request
        .post(`/${COMPANY_API_TAG}`)
        .send({ name, industry_id: notExistingIndustryId });
      expect(get(body, 'statusCode')).toBe(404);
      expect(get(body, 'message')).toBe(INDUSTRY_TREE_NOT_FOUND_ERROR);
    });

    it('Should return 400 error with invalid industry_id', async () => {
      const name = faker.company.companyName();

      const { body } = await request.post(`/${COMPANY_API_TAG}`).send({ name, industry_id: '' });
      expect(get(body, 'statusCode')).toBe(400);
    });

    it('Should return 400 error with invalid name', async () => {
      const randomNumber = faker.random.number({
        min: -1,
        max: -1000,
      });

      const { body } = await request
        .post(`/${COMPANY_API_TAG}`)
        .send({ name: randomNumber, industry_id: randomNumber });
      expect(get(body, 'statusCode')).toBe(400);
    });
  });

  describe(`CompanyModule DELETE ${COMPANY_API_TAG}`, () => {
    it('Should delete company', async () => {
      const company: Company = await createCompanyHelper();

      await request.delete(`/${COMPANY_API_TAG}/${company.id}`);

      const deletedCompanyCapChildren = await capabilityTreeSrv.treeRepository.find({
        company_id: company.id,
      });

      expect(deletedCompanyCapChildren.length).toBe(0);
    });

    it('Should throw 404 error for deleting not existing', async () => {
      const randomId = faker.random.number({
        min: -1,
        max: -1000,
      });
     const { status } = await request.delete(`/${COMPANY_API_TAG}/${randomId}`);
    
     expect(status).toBe(404);
    });
  });
});
