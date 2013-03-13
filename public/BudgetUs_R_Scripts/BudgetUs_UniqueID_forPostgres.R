setwd("/Users/raulfoo/Desktop")

dat = read.csv("BudgetUs_search.txt",sep=",",stringsAsFactors=F)

output = array(dim=c(nrow(dat),8))

for(i in 1:nrow(dat)){
	workDat = dat[i,1]
	splits = strsplit(workDat,"-->")[[1]]
	for(j in 1:length(splits)){
		output[i,j] = splits[j]  #split into subfunction,agency,bureau,program levels
		
		
	}
	output[i,5] = workDat
	output[i,6] = i # unique numbers
	output[i,7] = #levelDown
	output[i,8] = dat[i,2] #ids of all programs in this search criteria set
	
	
	
}


write.table(output,"Postgres_ID_Search.txt",sep=",",row.names=F,col.names=F)

#-------


findAbsoluteIndex = function(search){
absoluteIndex = dat
indices = c()
for(z in c(1:4)){
	#absoluteIndex = absoluteIndex[which(absoluteIndex[,z]==search[z]),]	
	indices = c(indices,which(absoluteIndex[,z]==search[z]))
}
indices = as.data.frame(table(indices),stringsAsFactors=F)
absolutePosition = as.numeric(indices[which(indices[,2]==max(indices[,2])),1])

absolutePosition
}

subFunctionOut = c()

dat = output
for(mainIndex in unique(dat[,1])){
	workDat = dat[which(dat[,1]==mainIndex),]
	temp = unique(workDat[,2])
	temp = temp[is.na(temp)==F]
	#temp = temp[seq(3,length(temp),by=3)]
	
	branchAddresses = c()
	for(k in temp){
		search = workDat[grep(k,workDat[,2])[1],]
		absolutePosition = findAbsoluteIndex(search)
		branchAddresses = c(branchAddresses,absolutePosition)
	}
	branchPaste = paste(branchAddresses,collapse=",")
	subFunctionOut = rbind(bigOut,c(mainIndex,branchPaste))
}

agencyStarts = c()
for(i in subFunctionOut[,2]){
	agencyStarts = c(agencyStarts,as.numeric(strsplit(i,",")[[1]]))
	
	
}
agencyStarts = unique(agencyStarts)





#bigOut as an array that maps every agency to every subfunction

#can loop through every unique value in bigOut[,2], and map every bureau to that agency, and do the same program --> bureau

#go through each branch just found and find branches for that














setwd("/Users/raulfoo/Desktop")

dat = read.csv("ComprehensiveBudget.csv",stringsAsFactors=F)
dat= dat[,-c(1,3,7,8,11,12)]

dat = dat[-(which(dat[,3]==0)),]
dat = dat[is.na(dat[,3])==F,]

newID = c(1:dim(dat)[1])
dat[,3] = newID

dat = dat[,c(1:6)]

#subfunctions
subfunction = unique(dat[,5])

columns = c(5,1,2,3)
#columns = c(3,2,1,5)
output = c()



for(i in unique(dat[,5])){
	subFunctionDat = dat[which(dat[,5]==i),]
	output = c(output,i)
	for(j in unique(subFunctionDat[,1])){
		
		agencyDat = subFunctionDat[which(subFunctionDat[,1]==j),]
		output = c(output,paste(i,paste(j,"(Total)"),sep="-->"))
		output = c(output,paste(i,paste(j,"(List)"),sep="-->"))
		for(k in unique(agencyDat[,2])){
			
			bDat = agencyDat[which(agencyDat[,2]==k),]
			mandatories = agencyDat[which(agencyDat[,2]==k),6]
			output = c(output,paste(i,j,paste(k,"(Total)"),sep="-->"))
			output = c(output,paste(i,j,paste(k,"(List)"),sep="-->"))
			index=1
			for(z in bDat[,4]){
				
				zString = paste(z," (",mandatories[index],")",sep="")
				output = c(output,paste(i,j,k,zString,sep="-->"))
			}
		}
		
	}
}

levelDown = c()

for(k in 1:length(output)){
	searchString = gsub("\\([^)]*\\)","",output[k])
	indices = grep(searchString,output)
	indices = paste(indices[-which(indices==k)],collapse=",")
	if(indices==0) indices=k
	levelDown = rbind(levelDown,indices)
	if(k %% 500 == 0) print(k)
	
}



#alternate
cols = c(3,2,1)
for(colIndex in cols){
	loop = unique(output[,colIndex])
	loop = loop[-(is.na(loop)==T)]
	for(i in loop)
		temp = which(output[,colIndex]==i)
		}
