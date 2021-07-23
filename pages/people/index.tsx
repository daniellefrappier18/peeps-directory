import Nav from '@hashicorp/react-nav'
import Footer from '@hashicorp/react-footer'
import rivetQuery from '@hashicorp/platform-cms'
import { GetStaticPropsResult } from 'next'
import { PersonRecord, DepartmentRecord } from 'types'
import style from './style.module.css'
import query from './query.graphql'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Avatar from './img/no-avatar.png';
import { useState } from 'react';


interface Props {
  allPeople: PersonRecord[]
  allDepartments: DepartmentRecord[]
}

export default function PeoplePage({
  allPeople,
  allDepartments,
}: Props): React.ReactElement {
  let findChildren = function(i) {
    var itemID = i;
    var children = [];
    for (var key in allDepartments) {
      if (allDepartments[key].parent !== null) {
        if(itemID === allDepartments[key].parent.id ){
          children.push({name: allDepartments[key].name, id: allDepartments[key].id, children: allDepartments[key].children,})
        }
      }
    }
    return children;
  }

  let findChildrenofChildren = function(id) {
    var bigChildID = id;
    var morechildren = [];
    for (var key in allDepartments) {
      if (allDepartments[key].parent !== null) {
        if(bigChildID === allDepartments[key].parent.id ){
          morechildren.push(allDepartments[key].name)
        }
      }
    }
    return morechildren;
  }
  const [filter, updateFilter] = useState('');
  const [personSearch, updatePersonSearch] = useState('');
  const [noImage, updateNoImage] = useState(false);
  const [accordionOpen, updateAccordionOpen] = useState(false);

  function handleAccordionToggle (n) {
    let name = n;
    if(!accordionOpen) updateAccordionOpen(true);
    else updateAccordionOpen(false);
    updateFilter(name)
  }

  function handleNoImage () {
    if(!noImage) updateNoImage(true);
    else updateNoImage(false);
  }

  function handleSearch (e) {
    updatePersonSearch(e.target.value);
    //set filter back to empty
    updateFilter('');
    updateNoImage(false);
  }

  function clearAll () {
    updatePersonSearch('');
    updateFilter('');
    updateNoImage(false);
  }
  return (
    <>
    <Nav />
      <main className="my-5">
        <div className="container">
          <div className="row">
            <div className="col text-center">
              <h1 className="fw-light">HashiCorp Humans</h1>
              <p>Find a HashiCorp human</p>
              <form className="col-auto me-5">
                  <div className={style.searchBox}>
                    <FontAwesomeIcon icon={faSearch} className={style.searchIcon + " me-2"} />
                    <input type="search" value={personSearch} onChange={handleSearch} className={style.search + " form-control mx-auto"} placeholder="Search people by name" aria-label="Search" />
                  </div>
              </form>
            </div>
            <div className="row text-center pt-2">
              <div className="form-check col-12">
                <input onChange={handleNoImage} className="form-check-input float-none me-3" type="checkbox" value="" id="flexCheckDefault" />
                <label className="form-check-label" htmlFor="noImagePeeps">
                  Hide people missing a profile image
                </label>
              </div>
              
            </div>
            <div className="row pt-5">
              <div className="col-md-4 d-md-block d-sm-none">
                  <p className="fw-bold">Filter By Department</p>
                  {allDepartments.sort(function(a, b) {
                    if(a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                    if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                    return 0;
                  }).map((item) => {
                    return (
                      <div key={item.name}>
                        {item.parent === null ? 
                            <div>
                              {item.children.length !== 0 ? <div className={style.filterButton} onClick={()=>handleAccordionToggle(item.name)}><FontAwesomeIcon icon={faChevronDown} className={style.filterDepartmentsIcon} /> {item.name}</div> : <div className={style.filterButton} onClick={()=>updateFilter(item.name)}> <FontAwesomeIcon icon={faChevronRight} className={style.filterDepartmentsIcon}/> {item.name}</div>}
                              <div>{findChildren(item.id).map(child => {
                                return(
                                  <div className={accordionOpen ? 'd-block' : 'd-none'} key={child.name}>
                                    {child.children.length !== 0 ? <div className={style.filterChild}><FontAwesomeIcon icon={faChevronDown} className={style.filterDepartmentsIcon} /> {child.name}</div> : <div className={style.filterChild}>{child.name}</div>}
                                    <div>{findChildrenofChildren(child.id).map(smallerchild => {
                                      return(
                                        <div key={smallerchild}>
                                          <div className={style.filterChildofChild}>{smallerchild}</div>
                                        </div>
                                      )
                                    })}
                                    </div>
                                  </div>
                                )
                              })}</div>
                            </div>
                        : ''}
                      </div>
                    )})}
                    <p className={style.danielleDisclaimer}>I know this wasn't in the scope, but I felt like this was needed</p>
                    <button onClick={clearAll} className="btn btn-primary">Clear All</button>
              </div>
              <div className="col-md-8">
                <div className="row">
                {filter === '' && personSearch === '' && !noImage ? allPeople.map(person => { //first list everyone
                  return (
                    <div key={person.name} className="col-lg-4 col-md-6 col-sm-12 my-3 text-center">
                      <div className="card h-100">
                        <div className="card-body">
                          {person.avatar !== null ? 
                              <div className="mx-auto">
                                <img className={style.avatar} src={person.avatar.url} alt={person.name} />
                              </div>
                            :
                              <div className="mx-auto">  
                                <img className={style.avatar} src={Avatar} alt={person.name} />
                              </div>
                          }
                          <h5 className="card-title">{person.name}</h5>
                          <p className="mb-0">{person.title}</p>
                          <p>{person.department.name}</p>
                        </div>
                      </div>
                    </div>
                  )
                }) : filter !== '' && !noImage ? allPeople.filter(person=>{ //filter by department 
                   if (person.department.name === filter) {
                    return true
                   } return false 
                }).map(person =>{
                  return (
                    <div key={person.name} className="col-md-4 my-3 text-center">
                    <div className="card h-100">
                      <div className="card-body">
                        {person.avatar !== null ? 
                            <div className="mx-auto">
                              <img className={style.avatar} src={person.avatar.url} alt={person.name} />
                            </div>
                          :
                            <div className="mx-auto">  
                              <img className={style.avatar} src={Avatar} alt={person.name} />
                            </div>
                        }
                        <h5 className="card-title">{person.name}</h5>
                        <p className="mb-0">{person.title}</p>
                        <p>{person.department.name}</p>
                      </div>
                    </div>
                  </div>
                  )
                }) : personSearch !== '' && !noImage ?  allPeople.filter(person=>{ //filter by person's name
                  if (person.name === personSearch) {
                   return true
                  } return false 
               }).map(person =>{
                 return (
                   <div key={person.name} className="col-md-4 my-3 text-center">
                   <div className="card h-100">
                     <div className="card-body">
                       {person.avatar !== null ? 
                           <div className="mx-auto">
                             <img className={style.avatar} src={person.avatar.url} alt={person.name} />
                           </div>
                         :
                           <div className="mx-auto">  
                             <img className={style.avatar} src={Avatar} alt={person.name} />
                           </div>
                       }
                       <h5 className="card-title">{person.name}</h5>
                       <p className="mb-0">{person.title}</p>
                       <p>{person.department.name}</p>
                     </div>
                   </div>
                 </div>
                 )
               }) : noImage && filter === ''  ? allPeople.filter(person=>{ //filter out no image people
                  if (person.avatar !== null) {
                  return true
                  } return false 
               }).map(person =>{
                 return (
                   <div key={person.name} className="col-md-4 my-3 text-center">
                   <div className="card h-100">
                     <div className="card-body">
                        <div className="mx-auto">  
                          <img className={style.avatar} src={person.avatar.url} alt={person.name} />
                        </div> 
                       <h5 className="card-title">{person.name}</h5>
                       <p className="mb-0">{person.title}</p>
                       <p>{person.department.name}</p>
                     </div>
                   </div>
                 </div>
                 )
               }) : noImage && filter !== ''  ? allPeople.filter(person=>{ //filter out no image people and filter by department 
                if (person.avatar !== null && person.department.name === filter) {
                return true
                } return false 
             }).map(person =>{
               return (
                 <div key={person.name} className="col-md-4 my-3 text-center">
                 <div className="card h-100">
                   <div className="card-body">
                      <div className="mx-auto">  
                        <img className={style.avatar} src={person.avatar.url} alt={person.name} />
                      </div> 
                     <h5 className="card-title">{person.name}</h5>
                     <p className="mb-0">{person.title}</p>
                     <p>{person.department.name}</p>
                   </div>
                 </div>
               </div>
               )
             }) : 'Sorry no people found here :('}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export async function getStaticProps(): Promise<GetStaticPropsResult<Props>> {
  const data = await rivetQuery({ query })
  return { props: data }
}
